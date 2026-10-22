import { useState, useMemo } from "react";
import { AsistenciaFilters } from "../components/AsistenciaFilters";
import { AsistenciasTable } from "../components/AsistenciasTable";
import { RegistroAsistenciaModal } from "../components/RegistroAsistenciaModal";
import {
  useGetAsistenciasQuery,
  useRegistrarAsistenciaMutation,
} from "../services/asistenciasApi";
import type { Asistencia, RegistroAsistenciaPayload } from "../types/asistencia.types";

const fallbackAsistencias: Asistencia[] = [
  {
    id: 1,
    beneficiarioNombre: "Carlos Alberto Mendoza Quispe",
    beneficiarioDni: "45892134",
    hitoNombre: "Taller de Capacitación en Emprendimiento",
    fecha: "2026-10-22",
    hora: "08:42 AM",
    estado: "PRESENTE",
    metodo: "QR",
  },
  {
    id: 2,
    beneficiarioNombre: "María Elena Huamán Tello",
    beneficiarioDni: "71283940",
    hitoNombre: "Taller de Capacitación en Emprendimiento",
    fecha: "2026-10-22",
    hora: "09:05 AM",
    estado: "TARDANZA",
    metodo: "QR",
    observacion: "Ingresó con 15m de tardanza",
  },
  {
    id: 3,
    beneficiarioNombre: "Juan Alberto Ramos Salazar",
    beneficiarioDni: "40928371",
    hitoNombre: "Taller de Capacitación en Emprendimiento",
    fecha: "2026-10-22",
    hora: "08:35 AM",
    estado: "PRESENTE",
    metodo: "BIOMETRICO",
  },
  {
    id: 4,
    beneficiarioNombre: "Rosa Luz Palacios Vega",
    beneficiarioDni: "47291038",
    hitoNombre: "Taller de Capacitación en Emprendimiento",
    fecha: "2026-10-22",
    hora: "09:12 AM",
    estado: "JUSTIFICADO",
    metodo: "DNI_MANUAL",
    observacion: "Constancia médica presentada",
  },
  {
    id: 5,
    beneficiarioNombre: "Luis Fernando Castro Flores",
    beneficiarioDni: "43928172",
    hitoNombre: "Taller de Capacitación en Emprendimiento",
    fecha: "2026-10-22",
    hora: "—",
    estado: "FALTA",
    metodo: "DNI_MANUAL",
  },
];

export function AsistenciasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: apiData, isLoading } = useGetAsistenciasQuery();
  const [registrarAsistencia, { isLoading: isRegistering }] = useRegistrarAsistenciaMutation();

  const [localData, setLocalData] = useState<Asistencia[]>(fallbackAsistencias);

  const dataList = apiData && apiData.length > 0 ? apiData : localData;

  const filteredAsistencias = useMemo(() => {
    return dataList.filter((item) => {
      const matchesSearch =
        item.beneficiarioDni.includes(searchTerm) ||
        item.beneficiarioNombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "TODOS" || item.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dataList, searchTerm, statusFilter]);

  const handleRegistrar = async (payload: RegistroAsistenciaPayload) => {
    try {
      await registrarAsistencia(payload).unwrap();
    } catch {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const newRecord: Asistencia = {
        id: Date.now(),
        beneficiarioNombre: `Beneficiario (DNI: ${payload.dni})`,
        beneficiarioDni: payload.dni,
        hitoNombre: "Taller de Capacitación en Emprendimiento",
        fecha: now.toISOString().split("T")[0],
        hora: timeStr,
        estado: "PRESENTE",
        metodo: payload.metodo || "QR",
        observacion: payload.observacion,
      };
      setLocalData((prev) => [newRecord, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      <AsistenciaFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenRegistroModal={() => setIsModalOpen(true)}
      />

      <AsistenciasTable
        asistencias={filteredAsistencias}
        isLoading={isLoading}
      />

      <RegistroAsistenciaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegistrar={handleRegistrar}
        isLoading={isRegistering}
      />
    </div>
  );
}

export default AsistenciasPage;
