import { useState, useMemo } from "react";
import { AsistenciaFilters } from "../components/AsistenciaFilters";
import { AsistenciasTable } from "../components/AsistenciasTable";
import { RegistroAsistenciaModal } from "../components/RegistroAsistenciaModal";
import { Button } from "@/components/ui";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import {
  useGetSesionesQuery,
  useRegistrarSesionMutation,
} from "../services/asistenciasApi";
import type {
  SesionAsistencia,
  RegistrarSesionPayload,
} from "../types/asistencia.types";

export function AsistenciasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Consulta directa a GET /api/sesiones (Swagger: Lista las sesiones de la persona)
  const {
    data: sesiones = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetSesionesQuery();

  const [registrarSesion, { isLoading: isRegistering }] =
    useRegistrarSesionMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const filteredAsistencias = useMemo(() => {
    return sesiones.filter((item: SesionAsistencia) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (item.beneficiarioDni?.includes(term) ?? false) ||
        (item.beneficiarioNombre?.toLowerCase().includes(term) ?? false) ||
        (item.fecha?.includes(term) ?? false);

      const itemEstado = (item.estado || "PRESENTE").toUpperCase();
      const matchesStatus =
        statusFilter === "TODOS" || itemEstado === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [sesiones, searchTerm, statusFilter]);

  const handleRegistrar = async (payload: RegistrarSesionPayload) => {
    await registrarSesion(payload).unwrap();
    showNotification("Asistencia registrada exitosamente en el servidor.");
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1">
          <AsistenciaFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onOpenRegistroModal={() => setIsModalOpen(true)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          isLoading={isFetching && !isLoading}
          className="self-end sm:self-center px-3"
          title="Refrescar sesiones desde el servidor"
        >
          <RefreshCw className="w-4 h-4 text-olivo" />
        </Button>
      </div>

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
