import { useState } from "react";
import { HitosAdminTable } from "../components/HitosAdminTable";
import { DetalleHitoAdminModal } from "../components/DetalleHitoAdminModal";
import { AgendarFechasModal } from "../components/AgendarFechasModal";
import { RevisarHitoModal } from "../components/RevisarHitoModal";
import { ReporteHitoModal } from "../components/ReporteHitoModal";
import { Button, Card } from "@/components/ui";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  CalendarPlus,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Flag,
  UserCheck,
  Filter,
} from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetHitosAdminQuery,
  useAgendarFechasHitoMutation,
  useRevisarFechasHitoMutation,
} from "../services/hitosApi";
import type {
  HitoAdmin,
  AgendarFechasHitoPayload,
  RevisarFechasHitoPayload,
  ListarHitosAdminParams,
} from "../types/hito.types";

export function HitosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [revisionFilter, setRevisionFilter] = useState<
    "pendiente" | "valida" | "observada" | ""
  >("");
  const [estadoFilter, setEstadoFilter] = useState<"activo" | "cerrado" | "">("");
  const [incluirSinHito, setIncluirSinHito] = useState(false);

  // Estado para selección múltiple de beneficiarios
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<number[]>([]);

  // Estados de modales
  const [selectedHitoDetailId, setSelectedHitoDetailId] = useState<number | null>(
    null
  );
  const [selectedHitoForAgendar, setSelectedHitoForAgendar] =
    useState<HitoAdmin | null>(null);
  const [selectedHitoForRevisar, setSelectedHitoForRevisar] =
    useState<HitoAdmin | null>(null);
  const [selectedHitoForReporte, setSelectedHitoForReporte] =
    useState<HitoAdmin | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Parámetros exactos según la documentación de Swagger: GET /api/admin/hitos
  const queryParams: ListarHitosAdminParams = {
    q: debouncedSearch.trim() || undefined,
    revision: revisionFilter || undefined,
    estado: estadoFilter || undefined,
    incluir_sin_hito: incluirSinHito,
  };

  // Consulta a la API de administración
  const {
    data: hitos = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetHitosAdminQuery(queryParams);

  const [agendarFechas, { isLoading: isAgendando }] =
    useAgendarFechasHitoMutation();

  const [revisarFechas, { isLoading: isRevisando }] =
    useRevisarFechasHitoMutation();

  // Contadores para KPIs
  const totalHitos = hitos.length;
  const pendientesRevision = hitos.filter(
    (h) => h.revision === "pendiente" && h.id !== null
  ).length;
  const observados = hitos.filter((h) => h.revision === "observada").length;
  const sinHito = hitos.filter((h) => !h.tiene_hito || h.id === null).length;

  const handleToggleSelectBeneficiary = (beneficiarioId: number) => {
    if (selectedBeneficiaries.includes(beneficiarioId)) {
      setSelectedBeneficiaries(selectedBeneficiaries.filter((id) => id !== beneficiarioId));
    } else {
      setSelectedBeneficiaries([...selectedBeneficiaries, beneficiarioId]);
    }
  };

  const handleSelectAllBeneficiaries = (select: boolean) => {
    if (select) {
      const allIds = hitos
        .map((h) => h.persona_id || h.persona?.id || h.id || 0)
        .filter((id) => id > 0);
      setSelectedBeneficiaries(Array.from(new Set(allIds)));
    } else {
      setSelectedBeneficiaries([]);
    }
  };

  const handleOpenAgendar = (hito: HitoAdmin) => {
    const bId = hito.persona_id || hito.persona?.id || hito.id || 0;
    if (bId && !selectedBeneficiaries.includes(bId)) {
      setSelectedBeneficiaries([bId]);
    }
    setSelectedHitoForAgendar(hito);
  };

  const handleOpenRevisar = (hito: HitoAdmin) => {
    setSelectedHitoForRevisar(hito);
  };

  const handleViewDetail = (hito: HitoAdmin) => {
    if (hito.id) {
      setSelectedHitoDetailId(hito.id);
    }
  };

  const handleOpenReporte = (hito: HitoAdmin) => {
    setSelectedHitoForReporte(hito);
  };

  const handleSaveAgendarFechas = async (payload: AgendarFechasHitoPayload) => {
    // Enviar el array de beneficiarios seleccionados hacia el endpoint en lugar del ID del primer elemento
    const listToSend =
      selectedBeneficiaries.length > 0
        ? selectedBeneficiaries
        : payload.selectedBeneficiaries && payload.selectedBeneficiaries.length > 0
          ? payload.selectedBeneficiaries
          : payload.persona_id
            ? [payload.persona_id]
            : [];

    const payloadWithBeneficiaries: AgendarFechasHitoPayload = {
      ...payload,
      selectedBeneficiaries: listToSend,
      beneficiarios: listToSend,
      persona_ids: listToSend,
    };

    await agendarFechas(payloadWithBeneficiaries).unwrap();
    setSelectedBeneficiaries([]);
    showNotification(
        `Fechas de sesiones registradas exitosamente para ${listToSend.length > 1 ? `${listToSend.length} beneficiarios` : "el beneficiario"
        } (POST /api/hitos/fechas).`
    );
  };

  const handleSaveRevisarHito = async (payload: RevisarFechasHitoPayload) => {
    await revisarFechas(payload).unwrap();
    showNotification(
      "Dictamen de revisión guardado satisfactoriamente (PUT /api/hitos/{id}/revision)."
    );
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

      {/* Cabecera Principal del Dashboard Admin */}
      <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-guinda text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-carbon tracking-tight">
              Dashboard de Hitos y Sesiones (Panel Administrativo)
            </h2>
          </div>
          <p className="text-xs text-olivo">
            Monitoreo general de hitos para Asistentes, Jueces, Administradores y Superadministradores (/api/admin/hitos).
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching && !isLoading}
            leftIcon={<RefreshCw className="w-4 h-4 text-olivo" />}
            title="Refrescar lista desde el servidor"
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (selectedBeneficiaries.length === 0) {
                if (hitos.length > 0) {
                  const firstId = hitos[0].persona_id || hitos[0].persona?.id || hitos[0].id || 0;
                  if (firstId) setSelectedBeneficiaries([firstId]);
                  setSelectedHitoForAgendar(hitos[0]);
                }
              } else {
                const matched = hitos.find((h) =>
                  selectedBeneficiaries.includes(h.persona_id || h.persona?.id || h.id || 0)
                );
                setSelectedHitoForAgendar(matched || hitos[0] || null);
              }
            }}
            leftIcon={<CalendarPlus className="w-4 h-4" />}
            className="font-bold shrink-0"
          >
            Agendar Fechas{selectedBeneficiaries.length > 0 ? ` (${selectedBeneficiaries.length})` : ""}
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI para Asistentes, Jueces y Admins */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hitos */}
        <Card hoverable className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-olivo">
              Total Registros
            </span>
            <div className="w-8 h-8 rounded-lg bg-carbon/10 text-carbon flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-carbon">{totalHitos}</div>
            <p className="text-[11px] text-olivo font-semibold mt-1">
              Beneficiarios monitoreados
            </p>
          </div>
        </Card>

        {/* Pendientes de Revisión (Para Jueces) */}
        <Card hoverable className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pendientes de Revisión
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-900">
              {pendientesRevision}
            </div>
            <p className="text-[11px] text-amber-800 font-semibold mt-1">
              Requieren dictamen judicial/admin
            </p>
          </div>
        </Card>

        {/* Observados */}
        <Card hoverable className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Hitos Observados
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-900">{observados}</div>
            <p className="text-[11px] text-rose-800 font-semibold mt-1">
              Con inconsistencias o plazos vencidos
            </p>
          </div>
        </Card>

        {/* Sin Hito Registrado */}
        <Card hoverable className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-guinda">
              Sin Hito Agendado
            </span>
            <div className="w-8 h-8 rounded-lg bg-guinda/10 text-guinda flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-guinda">{sinHito}</div>
            <p className="text-[11px] text-olivo font-semibold mt-1">
              Asistente debe registrar fechas
            </p>
          </div>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Búsqueda por q (nombre, DNI o expediente) */}
          <div className="relative flex-1 w-full sm:w-auto sm:min-w-[280px]">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o expediente (parámetro q)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold bg-suave/80 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
            />
          </div>

          {/* Filtros por revisión y estado */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtro Revisión */}
            <div className="flex items-center gap-1.5 bg-suave/80 px-2.5 py-1.5 rounded-field border border-linea">
              <Filter className="w-3.5 h-3.5 text-olivo shrink-0" />
              <select
                value={revisionFilter}
                onChange={(e) =>
                  setRevisionFilter(
                    e.target.value as "pendiente" | "valida" | "observada" | ""
                  )
                }
                className="text-xs font-bold text-carbon bg-transparent focus:outline-none cursor-pointer"
                title="Filtro por revisión de fechas"
              >
                <option value="">Todas las Revisiones</option>
                <option value="pendiente">Revisión: Pendiente</option>
                <option value="valida">Revisión: Válida</option>
                <option value="observada">Revisión: Observada</option>
              </select>
            </div>

            {/* Filtro Estado */}
            <div className="flex items-center gap-1.5 bg-suave/80 px-2.5 py-1.5 rounded-field border border-linea">
              <select
                value={estadoFilter}
                onChange={(e) =>
                  setEstadoFilter(e.target.value as "activo" | "cerrado" | "")
                }
                className="text-xs font-bold text-carbon bg-transparent focus:outline-none cursor-pointer"
                title="Filtro por estado del hito"
              >
                <option value="">Todos los Estados</option>
                <option value="activo">Estado: Activo</option>
                <option value="cerrado">Estado: Cerrado</option>
              </select>
            </div>

            {/* Checkbox incluir_sin_hito */}
            <label className="flex items-center gap-2 text-xs font-bold text-carbon cursor-pointer px-2 py-1 select-none">
              <input
                type="checkbox"
                checked={incluirSinHito}
                onChange={(e) => setIncluirSinHito(e.target.checked)}
                className="accent-guinda w-4 h-4 cursor-pointer"
              />
              <span>Incluir sin hito</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabla Principal de Hitos de Todos los Usuarios */}
      <div className="bg-white rounded-tile border border-linea/80 shadow-xs overflow-hidden">
        <HitosAdminTable
          hitos={hitos}
          isLoading={isLoading}
          selectedBeneficiaries={selectedBeneficiaries}
          onToggleSelectBeneficiary={handleToggleSelectBeneficiary}
          onSelectAllBeneficiaries={handleSelectAllBeneficiaries}
          onViewDetail={handleViewDetail}
          onAgendarFechas={handleOpenAgendar}
          onRevisar={handleOpenRevisar}
          onGenerarReporte={handleOpenReporte}
          onRetry={() => refetch()}
        />
      </div>

      {/* Modal Detalle Específico del Hito (GET /api/admin/hitos/{id}) */}
      <DetalleHitoAdminModal
        isOpen={Boolean(selectedHitoDetailId)}
        onClose={() => setSelectedHitoDetailId(null)}
        hitoId={selectedHitoDetailId}
        onAgendarFechas={handleOpenAgendar}
        onRevisar={handleOpenRevisar}
        onGenerarReporte={handleOpenReporte}
      />

      {/* Modal para POST /api/hitos/fechas */}
      <AgendarFechasModal
        isOpen={Boolean(selectedHitoForAgendar)}
        onClose={() => setSelectedHitoForAgendar(null)}
        hito={selectedHitoForAgendar}
        selectedBeneficiaries={selectedBeneficiaries}
        onAgendar={handleSaveAgendarFechas}
        isLoading={isAgendando}
      />

      {/* Modal para PUT /api/hitos/{id}/revision */}
      <RevisarHitoModal
        isOpen={Boolean(selectedHitoForRevisar)}
        onClose={() => setSelectedHitoForRevisar(null)}
        hito={selectedHitoForRevisar}
        onRevisar={handleSaveRevisarHito}
        isLoading={isRevisando}
      />

      {/* Modal de Constancia y Reporte Oficial del Hito (Descarga/Impresión PDF) */}
      <ReporteHitoModal
        isOpen={Boolean(selectedHitoForReporte)}
        onClose={() => setSelectedHitoForReporte(null)}
        hitoId={selectedHitoForReporte?.id || null}
        hitoFallback={selectedHitoForReporte}
      />
    </div>
  );
}

export default HitosPage;
