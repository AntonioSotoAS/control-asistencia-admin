import { useState, useMemo } from "react";
import { JustificacionesTable } from "../components/JustificacionesTable";
import { JustificacionModal } from "../components/JustificacionModal";
import { DetalleJustificacionModal } from "../components/DetalleJustificacionModal";
import { Button } from "@/components/ui";
import { Plus, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetJustificacionesQuery,
  useRegistrarJustificacionMutation,
} from "../services/justificacionesApi";
import type {
  Justificacion,
  RegistrarJustificacionPayload,
} from "../types/justificacion.types";

export function JustificacionesPage() {
  const [filterStatus, setFilterStatus] = useState<
    "TODOS" | "ENVIADA" | "PENDIENTE" | "EN_REVISION" | "APROBADA" | "OBSERVADA" | "RECHAZADA"
  >("TODOS");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedJustificacion, setSelectedJustificacion] =
    useState<Justificacion | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Consulta directa a la API real: GET /api/justificaciones
  const {
    data: justificaciones = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetJustificacionesQuery();

  const [registrarJustificacion, { isLoading: isRegistering }] =
    useRegistrarJustificacionMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Filtrado compuesto: por estado y por texto de búsqueda
  const filteredJustificaciones = useMemo(() => {
    return justificaciones.filter((item) => {
      // Filtro por pestaña de estado
      if (filterStatus !== "TODOS") {
        const itemEstado = (item.estado || "ENVIADA").toUpperCase();
        if (
          filterStatus === "ENVIADA" &&
          itemEstado !== "ENVIADA" &&
          itemEstado !== "PENDIENTE"
        ) {
          return false;
        }
        if (
          filterStatus === "EN_REVISION" &&
          !itemEstado.includes("REVISION") &&
          !itemEstado.includes("REVISIÓN")
        ) {
          return false;
        }
        if (
          filterStatus === "APROBADA" &&
          itemEstado !== "APROBADA" &&
          itemEstado !== "APROBADO" &&
          itemEstado !== "ACEPTADA" &&
          itemEstado !== "ACEPTADO"
        ) {
          return false;
        }
        if (
          filterStatus === "OBSERVADA" &&
          itemEstado !== "OBSERVADA" &&
          itemEstado !== "OBSERVADO" &&
          itemEstado !== "INCOMPLETA"
        ) {
          return false;
        }
        if (
          filterStatus === "RECHAZADA" &&
          itemEstado !== "RECHAZADA" &&
          itemEstado !== "RECHAZADO"
        ) {
          return false;
        }
      }

      // Filtro por término de búsqueda (DNI, beneficiario, motivo o hito)
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.toLowerCase().trim();
        const matchesNombre =
          item.beneficiarioNombre?.toLowerCase().includes(term) ?? false;
        const matchesDni =
          item.beneficiarioDni?.toLowerCase().includes(term) ?? false;
        const matchesMotivo =
          item.motivo?.toLowerCase().includes(term) ?? false;
        const matchesHito =
          item.hitoNombre?.toLowerCase().includes(term) ?? false;
        const matchesFecha =
          item.fecha?.toLowerCase().includes(term) ?? false;

        return (
          matchesNombre ||
          matchesDni ||
          matchesMotivo ||
          matchesHito ||
          matchesFecha
        );
      }

      return true;
    });
  }, [justificaciones, filterStatus, debouncedSearch]);

  const pendingCount = useMemo(() => {
    return justificaciones.filter((i) => {
      const e = (i.estado || "ENVIADA").toUpperCase();
      return e === "PENDIENTE" || e === "ENVIADA";
    }).length;
  }, [justificaciones]);

  const handleSaveJustificacion = async (payload: RegistrarJustificacionPayload) => {
    await registrarJustificacion(payload).unwrap();
    showNotification("Justificación de inasistencia registrada correctamente.");
  };

  return (
    <div className="space-y-6">
      {/* Notificación de éxito */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabecera y Controles */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-carbon tracking-tight">
            Bandeja de Justificaciones
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Registro y control de inasistencias fundamentadas con sustento probatorio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por DNI, beneficiario o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              isLoading={isFetching && !isLoading}
              className="px-3"
              title="Refrescar lista desde el servidor"
            >
              <RefreshCw className="w-4 h-4 text-olivo" />
            </Button>

            <Button
              variant="primary"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold shrink-0"
            >
              Registrar Justificación
            </Button>
          </div>
        </div>
      </div>

      {/* Pestañas de Filtrado por Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: "TODOS", label: "Todas" },
            { id: "ENVIADA", label: `Enviadas (${pendingCount})` },
            { id: "EN_REVISION", label: "En Revisión" },
            { id: "APROBADA", label: "Aprobadas" },
            { id: "OBSERVADA", label: "Observadas" },
            { id: "RECHAZADA", label: "Rechazadas" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${filterStatus === tab.id
              ? "bg-guinda text-white shadow-xs"
              : "bg-white text-olivo hover:text-carbon border border-linea/80"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabla con datos de la API */}
      <JustificacionesTable
        justificaciones={filteredJustificaciones}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onViewDetail={(item) => setSelectedJustificacion(item)}
        onRetry={() => refetch()}
      />

      {/* Modal Registrar Justificación */}
      <JustificacionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveJustificacion}
        isLoading={isRegistering}
      />

      {/* Modal Detalle de Justificación */}
      <DetalleJustificacionModal
        isOpen={Boolean(selectedJustificacion)}
        onClose={() => setSelectedJustificacion(null)}
        justificacion={selectedJustificacion}
      />
    </div>
  );
}

export default JustificacionesPage;
