import { useState, useMemo } from "react";
import { JustificacionesTable } from "../components/JustificacionesTable";
import { RevisionJustificacionModal } from "../components/RevisionJustificacionModal";
import {
  useGetJustificacionesQuery,
  useResponderJustificacionMutation,
} from "../services/justificacionesApi";
import type { Justificacion, ResponderJustificacionPayload } from "../types/justificacion.types";

const fallbackJustificaciones: Justificacion[] = [
  {
    id: 1,
    beneficiarioNombre: "Rosa Luz Palacios Vega",
    beneficiarioDni: "47291038",
    hitoNombre: "Taller de Capacitación en Emprendimiento",
    motivo: "Cita médica por control prenatal en Hospital Regional.",
    sustentoDocUrl: "/docs/cert-47291038.pdf",
    fechaSolicitud: "2026-10-22",
    estado: "PENDIENTE",
  },
  {
    id: 2,
    beneficiarioNombre: "Juan Alberto Ramos Salazar",
    beneficiarioDni: "40928371",
    hitoNombre: "Entrega de Módulos Nutricionales Octubre",
    motivo: "Diligencia judicial inaplazable en Juzgado de Paz Letrado.",
    sustentoDocUrl: "/docs/notificacion-40928371.pdf",
    fechaSolicitud: "2026-10-21",
    estado: "PENDIENTE",
  },
  {
    id: 3,
    beneficiarioNombre: "María Elena Huamán Tello",
    beneficiarioDni: "71283940",
    hitoNombre: "Jornada Médica Preventiva",
    motivo: "Familiar directo hospitalizado de emergencia.",
    sustentoDocUrl: "/docs/alta-71283940.pdf",
    fechaSolicitud: "2026-10-20",
    estado: "PENDIENTE",
  },
  {
    id: 4,
    beneficiarioNombre: "Luis Fernando Castro Flores",
    beneficiarioDni: "43928172",
    hitoNombre: "Asamblea General de Coordinación y Cierre Q3",
    motivo: "Descanso médico por accidente laboral leve.",
    fechaSolicitud: "2026-10-15",
    estado: "APROBADA",
    respuestaObservacion: "Certificado validado correctamente con el centro de salud.",
  },
];

export function JustificacionesPage() {
  const [filter, setFilter] = useState<"TODOS" | "PENDIENTE" | "APROBADA" | "RECHAZADA">("PENDIENTE");
  const [selectedJustificacion, setSelectedJustificacion] = useState<Justificacion | null>(null);

  const { data: apiData, isLoading } = useGetJustificacionesQuery();
  const [responderJustificacion, { isLoading: isResponding }] = useResponderJustificacionMutation();

  const [localData, setLocalData] = useState<Justificacion[]>(fallbackJustificaciones);

  const dataList = apiData && apiData.length > 0 ? apiData : localData;

  const filtered = useMemo(() => {
    if (filter === "TODOS") return dataList;
    return dataList.filter((item) => item.estado === filter);
  }, [dataList, filter]);

  const pendingCount = dataList.filter((i) => i.estado === "PENDIENTE").length;

  const handleResponder = async (payload: ResponderJustificacionPayload) => {
    try {
      await responderJustificacion(payload).unwrap();
    } catch {
      setLocalData((prev) =>
        prev.map((item) =>
          item.id === payload.id
            ? {
                ...item,
                estado: payload.estado,
                respuestaObservacion: payload.respuestaObservacion,
                fechaRespuesta: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-carbon tracking-tight">
            Bandeja de Justificaciones
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Evaluación y resolución de solicitudes de inasistencia presentadas por beneficiarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["PENDIENTE", "TODOS", "APROBADA", "RECHAZADA"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === tab
                  ? "bg-guinda text-white shadow-xs"
                  : "bg-suave text-olivo hover:text-carbon"
              }`}
            >
              {tab === "PENDIENTE" ? `Pendientes (${pendingCount})` : tab}
            </button>
          ))}
        </div>
      </div>

      <JustificacionesTable
        justificaciones={filtered}
        isLoading={isLoading}
        onReview={(item) => setSelectedJustificacion(item)}
      />

      <RevisionJustificacionModal
        isOpen={Boolean(selectedJustificacion)}
        onClose={() => setSelectedJustificacion(null)}
        justificacion={selectedJustificacion}
        onResponder={handleResponder}
        isLoading={isResponding}
      />
    </div>
  );
}

export default JustificacionesPage;
