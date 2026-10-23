import { useState, useMemo, useEffect } from "react";
import { AsistenciasTable } from "../components/AsistenciasTable";
import { RegistroAsistenciaModal } from "../components/RegistroAsistenciaModal";
import { Button, Badge } from "@/components/ui";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  User,
  Calendar,
  Building2,
  FileText,
  Clock,
  QrCode,
  Layers,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetSesionesQuery,
  useRegistrarSesionMutation,
} from "../services/asistenciasApi";
import { useGetBeneficiariosQuery } from "@/features/beneficiarios/services/beneficiariosApi";
import { useGetHitosAdminQuery } from "@/features/hitos/services/hitosApi";
import type { Beneficiario } from "@/features/beneficiarios/types/beneficiario.types";
import type { RegistrarSesionPayload } from "../types/asistencia.types";

export function AsistenciasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Beneficiario seleccionado para flujo jerárquico
  const [selectedBeneficiario, setSelectedBeneficiario] =
    useState<Beneficiario | null>(null);

  // Hito seleccionado dentro del beneficiario
  const [selectedHitoId, setSelectedHitoId] = useState<number | null>(null);

  // Modo de vista: "jerarquico" (por persona e hito) o "global" (todas las sesiones)
  const [viewMode, setViewMode] = useState<"jerarquico" | "global">("jerarquico");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Consulta de beneficiarios para búsqueda por Nombre o DNI
  const {
    data: beneficiarios = [],
    isFetching: isFetchingBeneficiarios,
  } = useGetBeneficiariosQuery(
    debouncedSearch.trim() ? { q: debouncedSearch.trim() } : undefined
  );

  // 2. Consulta de hitos del beneficiario seleccionado
  const {
    data: hitosBeneficiario = [],
    isFetching: isFetchingHitos,
    refetch: refetchHitos,
  } = useGetHitosAdminQuery(
    selectedBeneficiario ? { persona_id: selectedBeneficiario.id } : undefined,
    { skip: !selectedBeneficiario }
  );

  // Pre-seleccionar el primer hito disponible del beneficiario
  useEffect(() => {
    if (hitosBeneficiario.length > 0) {
      const primerHitoValido = hitosBeneficiario.find((h) => h.id !== null);
      if (primerHitoValido?.id) {
        setSelectedHitoId(primerHitoValido.id);
      } else {
        setSelectedHitoId(null);
      }
    } else {
      setSelectedHitoId(null);
    }
  }, [hitosBeneficiario]);

  // 3. Consulta de sesiones filtradas por persona e hito (o globales)
  const queryParams = useMemo(() => {
    if (viewMode === "jerarquico" && selectedBeneficiario) {
      return {
        persona_id: selectedBeneficiario.id,
        hito_id: selectedHitoId ?? undefined,
      };
    }
    return undefined;
  }, [viewMode, selectedBeneficiario, selectedHitoId]);

  const {
    data: sesiones = [],
    isLoading: isLoadingSesiones,
    isFetching: isFetchingSesiones,
    refetch: refetchSesiones,
  } = useGetSesionesQuery(queryParams);

  const [registrarSesion, { isLoading: isRegistering }] =
    useRegistrarSesionMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleRegistrar = async (payload: RegistrarSesionPayload) => {
    await registrarSesion(payload).unwrap();
    showNotification("Asistencia registrada exitosamente en el servidor.");
    refetchSesiones();
    if (selectedBeneficiario) {
      refetchHitos();
    }
  };

  // Hito activo actualmente seleccionado
  const currentHito = useMemo(() => {
    return hitosBeneficiario.find((h) => h.id === selectedHitoId) || null;
  }, [hitosBeneficiario, selectedHitoId]);

  // Sesiones asistidas vs totales del hito seleccionado
  const sesionesTotalesHito = currentHito?.sesiones_totales || currentHito?.sesiones_requeridas || sesiones.length;
  const sesionesAsistidasHito = sesiones.filter((s) => s.asistio).length;
  const porcentajeAvanceHito = sesionesTotalesHito > 0
    ? Math.min(100, Math.round((sesionesAsistidasHito / sesionesTotalesHito) * 100))
    : 0;

  const handleSelectBeneficiario = (b: Beneficiario) => {
    setSelectedBeneficiario(b);
    setSearchTerm("");
    setViewMode("jerarquico");
  };

  const handleClearBeneficiario = () => {
    setSelectedBeneficiario(null);
    setSelectedHitoId(null);
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

      {/* Cabecera Principal */}
      <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-guinda text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-carbon tracking-tight">
              Control y Registro de Asistencias
            </h2>
          </div>
          <p className="text-xs text-olivo">
            Busca por Nombre o DNI, selecciona el Hito del beneficiario y visualiza el cumplimiento de sus sesiones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Modo */}
          <div className="flex items-center bg-suave/80 p-1 rounded-field border border-linea text-xs">
            <button
              onClick={() => setViewMode("jerarquico")}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${viewMode === "jerarquico"
                ? "bg-white text-carbon shadow-xs"
                : "text-olivo hover:text-carbon"
                }`}
            >
              <User className="w-3.5 h-3.5" />
              Por Beneficiario e Hito
            </button>
            <button
              onClick={() => setViewMode("global")}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${viewMode === "global"
                ? "bg-white text-carbon shadow-xs"
                : "text-olivo hover:text-carbon"
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Todas las Sesiones
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSesiones();
              if (selectedBeneficiario) refetchHitos();
            }}
            isLoading={isFetchingSesiones || isFetchingHitos}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-olivo" />}
          >
            Refrescar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<QrCode className="w-4 h-4" />}
            className="font-bold shadow-xs"
          >
            Marcar Asistencia
          </Button>
        </div>
      </div>

      {/* Flujo 1: Búsqueda y Selección por Beneficiario */}
      {viewMode === "jerarquico" && (
        <div className="space-y-4">
          {!selectedBeneficiario ? (
            /* Buscador de Persona por Nombre o DNI */
            <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-carbon flex items-center gap-2">
                  <Search className="w-4 h-4 text-guinda" />
                  1. Buscar Beneficiario (por Nombre o DNI)
                </h4>
                <p className="text-xs text-olivo">
                  Ingresa el nombre o documento para consultar sus hitos y sesiones asociadas:
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Escribe el nombre o DNI (ej: Ana, Arturo, 73134656)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm font-medium bg-suave/80 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
                  autoFocus
                />
              </div>

              {/* Lista de Resultados de Beneficiarios */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-olivo">
                    Beneficiarios encontrados ({beneficiarios.length})
                  </span>
                  {isFetchingBeneficiarios && (
                    <span className="text-xs text-olivo italic animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {beneficiarios.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBeneficiario(b)}
                      className="p-3.5 rounded-tile bg-white border border-linea/80 hover:border-guinda/60 hover:shadow-sm cursor-pointer transition flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-sm text-carbon group-hover:text-guinda transition">
                            {b.nombre}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-olivo bg-suave px-1.5 py-0.5 rounded border border-linea/60 shrink-0">
                            DNI: {b.dni}
                          </span>
                        </div>

                        <div className="text-[11px] text-olivo space-y-0.5">
                          {b.expediente && (
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3 h-3 text-guinda shrink-0" />
                              <span className="font-mono font-medium truncate">{b.expediente}</span>
                            </div>
                          )}
                          {b.juzgado && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Building2 className="w-3 h-3 text-olivo shrink-0" />
                              <span className="truncate">{b.juzgado}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-linea/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {b.seguimiento || "En curso"}
                        </span>
                        <span className="text-xs font-bold text-guinda flex items-center gap-1 group-hover:translate-x-0.5 transition">
                          Ver Hitos <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}

                  {beneficiarios.length === 0 && !isFetchingBeneficiarios && (
                    <div className="col-span-full p-8 text-center bg-suave/40 rounded-tile border border-linea text-xs text-olivo">
                      No se encontraron beneficiarios con "{searchTerm}". Intenta con otro nombre o DNI.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Persona Seleccionada y sus Hitos */
            <div className="space-y-4">
              {/* Tarjeta del Beneficiario Seleccionado */}
              <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-guinda/10 text-guinda flex items-center justify-center font-bold text-base shrink-0 border border-guinda/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-black text-carbon">
                        {selectedBeneficiario.nombre}
                      </h3>
                      <span className="font-mono text-xs font-bold text-olivo bg-suave px-2 py-0.5 rounded border border-linea/60">
                        DNI: {selectedBeneficiario.dni}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-olivo">
                      {selectedBeneficiario.expediente && (
                        <span className="flex items-center gap-1 font-mono">
                          <FileText className="w-3 h-3 text-guinda" />
                          {selectedBeneficiario.expediente}
                        </span>
                      )}
                      {selectedBeneficiario.juzgado && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-olivo" />
                          {selectedBeneficiario.juzgado}
                        </span>
                      )}
                      {selectedBeneficiario.telefono && (
                        <span>Tel: {selectedBeneficiario.telefono}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearBeneficiario}
                  leftIcon={<X className="w-3.5 h-3.5 text-olivo" />}
                  className="font-bold shrink-0 self-end md:self-center"
                >
                  Cambiar Beneficiario
                </Button>
              </div>

              {/* Selector de Hitos del Beneficiario */}
              <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-guinda" />
                    2. Seleccionar Hito de Control ({hitosBeneficiario.length})
                  </h4>
                  {isFetchingHitos && (
                    <span className="text-xs text-olivo italic animate-pulse">
                      Cargando hitos...
                    </span>
                  )}
                </div>

                {hitosBeneficiario.length === 0 ? (
                  <div className="p-6 rounded-field bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Este beneficiario aún no tiene fechas de hitos ni sesiones programadas.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {hitosBeneficiario.map((hito) => {
                      const isSelected = selectedHitoId === hito.id;
                      return (
                        <button
                          key={hito.id ?? `hito-${hito.persona_id}`}
                          onClick={() => hito.id && setSelectedHitoId(hito.id)}
                          className={`p-3.5 rounded-tile border text-left transition flex flex-col justify-between ${isSelected
                            ? "bg-guinda/5 border-guinda shadow-xs ring-1 ring-guinda"
                            : "bg-white border-linea hover:border-linea/80 hover:bg-suave/40"
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-sm text-carbon">
                                {hito.nombre || `Hito #${hito.id}`}
                              </span>
                              <Badge
                                variant={
                                  hito.revision === "valida"
                                    ? "success"
                                    : hito.revision === "observada"
                                      ? "danger"
                                      : "warning"
                                }
                              >
                                {hito.revision}
                              </Badge>
                            </div>

                            <p className="text-xs text-olivo mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-guinda" />
                              Fecha límite: <strong>{hito.fecha_hito || hito.fecha || "No definida"}</strong>
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-linea/60 flex items-center justify-between text-xs">
                            <span className="font-semibold text-carbon">
                              {hito.sesiones_requeridas || hito.sesiones_totales || 0} sesiones requeridas
                            </span>
                            <span className="font-bold text-guinda">
                              {hito.asistencias_count || hito.sesiones_completadas || 0} asistidas
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Resumen de Asistencia del Hito Seleccionado */}
                {currentHito && (
                  <div className="p-4 rounded-field bg-suave/60 border border-linea space-y-2 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-carbon">
                        Avance del Hito: {sesionesAsistidasHito} de {sesionesTotalesHito} sesiones asistidas ({porcentajeAvanceHito}%)
                      </span>
                      <span className="text-[11px] font-semibold text-olivo">
                        Estado: <strong className="text-carbon uppercase">{currentHito.estado}</strong> | Revisión: <strong className="text-carbon uppercase">{currentHito.revision}</strong>
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-linea/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${porcentajeAvanceHito >= 100
                          ? "bg-emerald-600"
                          : porcentajeAvanceHito >= 50
                            ? "bg-guinda"
                            : "bg-amber-600"
                          }`}
                        style={{ width: `${Math.min(100, Math.max(porcentajeAvanceHito, 4))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lista Detallada de Sesiones del Hito */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-carbon flex items-center gap-2">
                    <Layers className="w-4 h-4 text-guinda" />
                    3. Sesiones del Hito y Estado de Asistencia ({sesiones.length})
                  </h4>
                  {isFetchingSesiones && (
                    <span className="text-xs text-olivo italic animate-pulse">
                      Actualizando sesiones...
                    </span>
                  )}
                </div>

                <div className="bg-white rounded-tile border border-linea/80 shadow-xs overflow-hidden">
                  <AsistenciasTable
                    asistencias={sesiones}
                    isLoading={isLoadingSesiones}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flujo 2: Vista Global de Todas las Sesiones */}
      {viewMode === "global" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filtrar todas las sesiones por nombre de beneficiario o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-semibold bg-suave/80 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
              />
            </div>
          </div>

          <div className="bg-white rounded-tile border border-linea/80 shadow-xs overflow-hidden">
            <AsistenciasTable
              asistencias={sesiones}
              isLoading={isLoadingSesiones}
            />
          </div>
        </div>
      )}

      {/* Modal de Marcación de Asistencia */}
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
