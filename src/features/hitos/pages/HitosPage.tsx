import { useState } from "react";
import { HitosList } from "../components/HitosList";
import { HitoModal } from "../components/HitoModal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import {
  useGetHitosQuery,
  useCrearHitoMutation,
  useActualizarHitoMutation,
} from "../services/hitosApi";
import type { Hito } from "../types/hito.types";

const fallbackHitos: Hito[] = [
  {
    id: 1,
    nombre: "Taller de Capacitación en Emprendimiento - Grupo A",
    descripcion: "Primera sesión presencial obligatoria para beneficiarios del programa.",
    fecha: "2026-10-22",
    horaInicio: "08:30",
    horaFin: "12:30",
    toleranciaMinutos: 15,
    ubicacion: "Auditorio Central - Av. Grau 450",
    estado: "EN_CURSO",
    totalEsperados: 120,
    totalAsistieron: 98,
  },
  {
    id: 2,
    nombre: "Entrega de Módulos Nutricionales Octubre",
    descripcion: "Registro biométrico previo a la distribución mensual de canastas.",
    fecha: "2026-10-22",
    horaInicio: "09:00",
    horaFin: "14:00",
    toleranciaMinutos: 30,
    ubicacion: "Centro Comunal Sector 3",
    estado: "EN_CURSO",
    totalEsperados: 180,
    totalAsistieron: 145,
  },
  {
    id: 3,
    nombre: "Jornada Médica Preventiva y Descarte",
    descripcion: "Control de salud integral y asistencia obligatoria para subsidio.",
    fecha: "2026-10-25",
    horaInicio: "08:00",
    horaFin: "13:00",
    toleranciaMinutos: 20,
    ubicacion: "Policlínico Municipal",
    estado: "PROGRAMADO",
    totalEsperados: 150,
    totalAsistieron: 0,
  },
  {
    id: 4,
    nombre: "Asamblea General de Coordinación y Cierre Q3",
    descripcion: "Evaluación de cumplimiento de metas y rendición participativa.",
    fecha: "2026-10-15",
    horaInicio: "10:00",
    horaFin: "13:00",
    toleranciaMinutos: 15,
    ubicacion: "Estadio Municipal - Tribuna Occidente",
    estado: "FINALIZADO",
    totalEsperados: 300,
    totalAsistieron: 284,
  },
];

export function HitosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHito, setEditingHito] = useState<Hito | null>(null);

  const { data: apiData, isLoading } = useGetHitosQuery();
  const [crearHito, { isLoading: isCreating }] = useCrearHitoMutation();
  const [actualizarHito, { isLoading: isUpdating }] = useActualizarHitoMutation();

  const [localData, setLocalData] = useState<Hito[]>(fallbackHitos);

  const hitos = apiData && apiData.length > 0 ? apiData : localData;

  const handleOpenCreateModal = () => {
    setEditingHito(null);
    setIsModalOpen(true);
  };

  const handleEdit = (hito: Hito) => {
    setEditingHito(hito);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Hito>) => {
    if (editingHito) {
      try {
        await actualizarHito({ id: editingHito.id, data }).unwrap();
      } catch {
        setLocalData((prev) =>
          prev.map((item) =>
            item.id === editingHito.id ? ({ ...item, ...data } as Hito) : item
          )
        );
      }
    } else {
      try {
        await crearHito(data).unwrap();
      } catch {
        const newHito: Hito = {
          id: Date.now(),
          nombre: data.nombre || "Nuevo Hito",
          descripcion: data.descripcion,
          fecha: data.fecha || new Date().toISOString().split("T")[0],
          horaInicio: data.horaInicio || "08:00",
          horaFin: data.horaFin || "12:00",
          toleranciaMinutos: data.toleranciaMinutos || 15,
          ubicacion: data.ubicacion || "Sede Principal",
          estado: data.estado || "PROGRAMADO",
          totalEsperados: data.totalEsperados || 100,
          totalAsistieron: 0,
        };
        setLocalData((prev) => [newHito, ...prev]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-carbon tracking-tight">
            Gestión de Hitos y Sesiones
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Configura los eventos en los que los beneficiarios deben registrar asistencia.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold"
        >
          Crear Hito
        </Button>
      </div>

      <HitosList hitos={hitos} isLoading={isLoading} onEdit={handleEdit} />

      <HitoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hitoToEdit={editingHito}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

export default HitosPage;
