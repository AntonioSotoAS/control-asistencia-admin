import { useState } from "react";
import { ActosProcesalesTable } from "../components/ActosProcesalesTable";
import { PersonaUsuarioModal } from "@/features/personas/components/PersonaUsuarioModal";
import { Button } from "@/components/ui";
import { Scale, RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { useGetActosProcesalesQuery } from "../services/actosProcesalesApi";

export function ActosProcesalesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [docId, setDocId] = useState("");
  const [nUnico, setNUnico] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");

  // Estado para el modal unificado de Registrar Persona y Cuenta
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetActosProcesalesQuery({
    page,
    limit,
    x_doc_id: docId.trim() || undefined,
    n_unico: nUnico.trim() || undefined,
    f_ingreso_acto: fechaIngreso || undefined,
  });

  const actos = data?.data || [];
  const pagination = data?.pagination;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenRegistrar = (targetDocId?: string) => {
    setSelectedDocId(targetDocId);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setDocId("");
    setNUnico("");
    setFechaIngreso("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notificación */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabecera y Barra de Filtros */}
      <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#562599] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-carbon tracking-tight">
                Consulta de Actos Procesales
              </h2>
            </div>
            <p className="text-xs text-olivo">
              Exploración de resoluciones, partes y expedientes emitidos por los juzgados de la Corte (/api/actos-procesales).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              isLoading={isFetching}
              title="Refrescar lista desde el servidor"
            >
              <RefreshCw className="w-4 h-4 text-olivo" />
            </Button>

            <Button
              variant="primary"
              onClick={() => handleOpenRegistrar()}
              leftIcon={<UserPlus className="w-4 h-4 text-white" />}
              className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold shrink-0"
            >
              Registrar Persona y Cuenta
            </Button>
          </div>
        </div>

        {/* Filtros de consulta */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-linea/60 text-xs">
          <div>
            <label className="text-[11px] font-bold text-olivo uppercase block mb-1">
              Documento (DNI)
            </label>
            <input
              type="text"
              value={docId}
              onChange={(e) => {
                setDocId(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por DNI..."
              className="w-full text-xs font-semibold bg-suave/60 border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda focus:bg-white transition font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-olivo uppercase block mb-1">
              N° Único Expediente
            </label>
            <input
              type="text"
              value={nUnico}
              onChange={(e) => {
                setNUnico(e.target.value);
                setPage(1);
              }}
              placeholder="Ej: 2024010101..."
              className="w-full text-xs font-semibold bg-suave/60 border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda focus:bg-white transition font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-olivo uppercase block mb-1">
              Fecha de Ingreso
            </label>
            <input
              type="date"
              value={fechaIngreso}
              onChange={(e) => {
                setFechaIngreso(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs font-semibold bg-suave/60 border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda focus:bg-white transition"
            />
          </div>

          <div className="flex items-end">
            {(docId || nUnico || fechaIngreso) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="w-full text-xs h-9"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-tile border border-linea/80 shadow-xs overflow-hidden">
        <ActosProcesalesTable
          actos={actos}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRegistrarPersona={(d) => handleOpenRegistrar(d)}
          onRetry={() => refetch()}
        />

        {/* Paginación */}
        {pagination && pagination.total > 0 && (
          <div className="p-4 border-t border-linea/80 bg-suave/30 flex items-center justify-between text-xs text-olivo">
            <div>
              Mostrando página <strong className="text-carbon">{pagination.current_page}</strong> de{" "}
              <strong className="text-carbon">{pagination.last_page}</strong> (
              {pagination.total} actos procesales registrados)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1 || isFetching}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.has_more_pages || isFetching}
                className="h-8 px-2 text-xs"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Unificado Registrar Persona y Cuenta */}
      <PersonaUsuarioModal
        isOpen={isModalOpen}
        initialDni={selectedDocId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDocId(undefined);
        }}
        onSuccess={showNotification}
      />
    </div>
  );
}

export default ActosProcesalesPage;
