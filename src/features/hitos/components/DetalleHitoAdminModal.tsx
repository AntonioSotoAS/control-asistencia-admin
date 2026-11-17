import { useState } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Building2,
  FileText,
  ShieldCheck,
  CalendarPlus,
  Loader2,
  Upload,
  CalendarClock,
} from "lucide-react";
import { useGetHitoAdminByIdQuery } from "../services/hitosApi";
import {
  useRegistrarSesionMutation,
  useReprogramarFechaSesionMutation,
} from "@/features/asistencias/services/asistenciasApi";
import { RegistroAsistenciaModal } from "@/features/asistencias/components/RegistroAsistenciaModal";
import { EditarFechaSesionModal } from "@/features/asistencias/components/EditarFechaSesionModal";
import type { HitoAdmin } from "../types/hito.types";
import type {
  SesionAsistencia,
  RegistrarSesionPayload,
} from "@/features/asistencias/types/asistencia.types";

interface DetalleHitoAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  hitoId: number | null;
  onAgendarFechas?: (hito: HitoAdmin) => void;
  onRevisar?: (hito: HitoAdmin) => void;
  onGenerarReporte?: (hito: HitoAdmin) => void;
}

export function DetalleHitoAdminModal({
  isOpen,
  onClose,
  hitoId,
  onAgendarFechas,
  onRevisar,
  onGenerarReporte,
}: DetalleHitoAdminModalProps) {
  const { data: hito, isLoading, refetch } = useGetHitoAdminByIdQuery(hitoId!, {
    skip: !isOpen || !hitoId,
  });

  const [registrarSesion, { isLoading: isRegistering }] =
    useRegistrarSesionMutation();
  const [reprogramarFechaSesion, { isLoading: isReprogramando }] =
    useReprogramarFechaSesionMutation();

  // Estados para modales de subida de pruebas y cambio de fecha
  const [sesionForPrueba, setSesionForPrueba] = useState<
    | (Partial<SesionAsistencia> & {
        personaNombre?: string;
        personaDni?: string;
        hitoNombre?: string;
      })
    | null
  >(null);
  const [sesionForFecha, setSesionForFecha] =
    useState<SesionAsistencia | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  if (!isOpen) return null;

  const persona = hito?.persona;
  const sesiones = hito?.sesiones || [];
  const total = hito?.sesiones_totales || hito?.sesiones_count || sesiones.length || 0;
  const asistidas = hito?.sesiones_completadas || hito?.asistencias_count || 0;
  const porcentaje = hito?.porcentaje_avance ?? 0;

  const fechaLimiteRaw = hito?.fecha_hito || hito?.fecha || "";
  const fechaLimiteStr = fechaLimiteRaw.includes("T")
    ? fechaLimiteRaw.split("T")[0]
    : fechaLimiteRaw || "No definida";

  const getRevisionBadge = (revision?: string) => {
    switch (revision?.toLowerCase()) {
      case "valida":
        return (
          <Badge variant="success" className="gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Revisión: Válida
          </Badge>
        );
      case "observada":
        return (
          <Badge variant="danger" className="gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            Revisión: Observada
          </Badge>
        );
      case "pendiente":
      default:
        return (
          <Badge variant="warning" className="gap-1 font-bold">
            <Clock className="w-3.5 h-3.5" />
            Revisión: Pendiente
          </Badge>
        );
    }
  };

  const handleOpenSubirPrueba = (
    s: {
      id?: number;
      numero?: number;
      fecha?: string;
      tipo?: string;
      asistio?: boolean;
      comprobante?: string | null;
      comprobante_url?: string | null;
      notas?: string | null;
    },
    idx: number
  ) => {
    if (!hito) return;
    setSesionForPrueba({
      id: s.id,
      persona_id: hito.persona_id,
      hito_id: hito.id ?? undefined,
      numero: s.numero ?? idx + 1,
      fecha: s.fecha?.includes("T") ? s.fecha.split("T")[0] : s.fecha || "",
      tipo: s.tipo || "presencial",
      asistio: true,
      comprobante: s.comprobante,
      comprobante_url: s.comprobante_url,
      notas: s.notas,
      personaNombre: persona?.nombre,
      personaDni: persona?.dni,
      hitoNombre: hito.nombre || `Hito #${hito.id}`,
    });
  };

  const handleOpenEditarFecha = (
    s: {
      id?: number;
      numero?: number;
      fecha?: string;
      tipo?: string;
      asistio?: boolean;
    },
    idx: number
  ) => {
    if (!hito) return;
    setSesionForFecha({
      id: Number(s.id || s.numero || 0),
      persona_id: hito.persona_id,
      hito_id: hito.id ?? undefined,
      numero: s.numero ?? idx + 1,
      fecha: s.fecha?.includes("T") ? s.fecha.split("T")[0] : s.fecha || "",
      tipo: (s.tipo as "presencial" | "virtual") || "presencial",
      asistio: Boolean(s.asistio),
      beneficiarioNombre: persona?.nombre,
      beneficiarioDni: persona?.dni,
      hitoNombre: hito.nombre || `Hito #${hito.id}`,
    });
  };

  const handleRegistrarPrueba = async (payload: RegistrarSesionPayload) => {
    const payloadToSend: RegistrarSesionPayload = {
      ...payload,
      persona_id: payload.persona_id || hito?.persona_id,
      hito_id: payload.hito_id || (hito?.id ?? undefined),
    };
    await registrarSesion(payloadToSend).unwrap();
    setSesionForPrueba(null);
    showToast(`Prueba y asistencia guardadas para la sesión #${payload.numero || ""}.`);
    await refetch();
  };

  const handleReprogramarFecha = async ({
    id,
    fecha,
  }: {
    id: number;
    fecha: string;
  }) => {
    await reprogramarFechaSesion({ id, fecha }).unwrap();
    setSesionForFecha(null);
    showToast(`Fecha de la sesión actualizada exitosamente a ${fecha}.`);
    await refetch();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={hito ? `Detalle Administrativo del Hito #${hito.id}` : "Detalle del Hito"}
        description="Consulta específica del hito, sesiones programadas y estado de validación (GET /api/admin/hitos/{id})."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {hito && onRevisar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onRevisar(hito);
                  }}
                  leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-700" />}
                >
                  Revisar Validez
                </Button>
              )}

              {hito && onAgendarFechas && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onAgendarFechas(hito);
                  }}
                  leftIcon={<CalendarPlus className="w-4 h-4 text-guinda" />}
                >
                  {sesiones.length > 0 ? "Modificar Fechas" : "Agendar Fechas"}
                </Button>
              )}

              {hito && onGenerarReporte && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onGenerarReporte(hito);
                  }}
                  leftIcon={<FileText className="w-4 h-4 text-white" />}
                  className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold"
                >
                  Reporte PDF
                </Button>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cerrar
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-olivo">
            <Loader2 className="w-8 h-8 animate-spin text-guinda" />
            <p className="text-xs font-semibold text-carbon">
              Obteniendo información del hito #{hitoId}...
            </p>
          </div>
        ) : !hito ? (
          <div className="p-8 text-center text-rose-700 text-xs font-semibold">
            No se encontró la información del hito solicitado.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Notificación Toast interna */}
            {toastMessage && (
              <div className="p-3.5 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Ficha Beneficiario */}
            <div className="p-4 rounded-tile bg-suave/80 border border-linea space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-guinda text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-carbon tracking-tight">
                      {persona?.nombre || `Beneficiario #${hito.persona_id}`}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs font-semibold text-olivo bg-white px-2 py-0.5 rounded border border-linea/60">
                        DNI: {persona?.dni || "—"}
                      </span>
                      {persona?.telefono && (
                        <span className="text-xs text-olivo">
                          Teléfono: {persona.telefono}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {getRevisionBadge(hito.revision)}
                  <Badge
                    variant={hito.estado === "activo" ? "success" : "default"}
                    className="capitalize font-semibold text-[11px]"
                  >
                    Estado: {hito.estado || "activo"}
                  </Badge>
                </div>
              </div>

              {/* Expediente y Juzgado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-linea/60 text-xs">
                <div className="flex items-center gap-2 text-carbon">
                  <FileText className="w-4 h-4 text-guinda shrink-0" />
                  <span>
                    Expediente:{" "}
                    <strong className="font-mono">
                      {persona?.expediente || "Sin expediente"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-carbon">
                  <Building2 className="w-4 h-4 text-olivo shrink-0" />
                  <span>
                    Juzgado: <strong>{persona?.juzgado || "No asignado"}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Avance del Hito */}
            <div className="p-4 rounded-tile bg-white border border-linea space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-carbon flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-guinda" />
                  Fecha Límite Hito:{" "}
                  <strong className="text-carbon">{fechaLimiteStr}</strong>
                </span>
                <span className="font-extrabold text-carbon">
                  {asistidas} de {total} sesiones cumplidas ({porcentaje}%)
                </span>
              </div>

              <div className="w-full h-2.5 bg-suave rounded-full overflow-hidden border border-linea/40">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    porcentaje >= 100
                      ? "bg-emerald-600"
                      : porcentaje >= 50
                      ? "bg-guinda"
                      : "bg-amber-600"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(porcentaje, 4))}%` }}
                />
              </div>

              {hito.observacion_revision && (
                <div className="mt-2 p-2.5 rounded-field bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <strong>Observaciones de Revisión:</strong> {hito.observacion_revision}
                </div>
              )}
            </div>

            {/* Sesiones del Hito con Acciones para Subir Prueba y Modificar Fecha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-carbon">
                  Sesiones Programadas y Asistencia ({sesiones.length})
                </h5>
                <span className="text-[11px] text-olivo font-semibold">
                  Puedes subir pruebas o corregir fechas sesión por sesión
                </span>
              </div>

              {sesiones.length === 0 ? (
                <div className="p-6 rounded-tile bg-suave/40 border border-linea text-center text-xs text-olivo">
                  Este beneficiario no tiene sesiones agendadas para su hito.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {sesiones.map((s, idx) => {
                    const fechaStr = s.fecha?.includes("T")
                      ? s.fecha.split("T")[0]
                      : s.fecha || "Sin fecha";

                    return (
                      <div
                        key={s.id || idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-field bg-white border border-linea text-xs gap-3 hover:border-linea/80 transition"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-suave flex items-center justify-center font-mono font-bold text-olivo text-[11px] shrink-0 mt-0.5 sm:mt-0">
                            #{s.numero ?? idx + 1}
                          </span>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-carbon">
                                {fechaStr}
                              </span>
                              {s.tipo && (
                                <span className="text-[10px] uppercase font-bold text-olivo bg-suave/80 px-1.5 py-0.5 rounded border border-linea/60">
                                  {s.tipo}
                                </span>
                              )}
                            </div>
                            {s.notas && (
                              <span className="text-[11px] text-olivo block italic">
                                Nota: {s.notas}
                              </span>
                            )}
                            {s.comprobante && (
                              <div className="mt-1">
                                {s.comprobante_url ? (
                                  <a
                                    href={s.comprobante_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-bold text-guinda hover:underline inline-flex items-center gap-1 bg-guinda/5 px-2 py-0.5 rounded border border-guinda/20"
                                  >
                                    📎 Comprobante: {s.comprobante} ↗
                                  </a>
                                ) : (
                                  <span className="text-[11px] text-olivo font-mono">
                                    📎 {s.comprobante}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-linea/50">
                          {s.asistio ? (
                            <Badge variant="success" className="gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Asistió
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-olivo font-medium">
                              Programada
                            </Badge>
                          )}

                          {/* Botón para Cambiar Fecha de esta Sesión */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditarFecha(s, idx)}
                            className="p-1.5 rounded-lg border border-linea hover:bg-suave text-olivo hover:text-carbon transition cursor-pointer"
                            title="Modificar fecha de esta sesión (PUT /api/sesiones/{id}/fecha)"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón para Subir Prueba de esta Sesión */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenSubirPrueba(s, idx)}
                            leftIcon={<Upload className="w-3.5 h-3.5 text-[#562599]" />}
                            className="bg-[#562599]/5 hover:bg-[#562599] text-[#562599] hover:text-white border-[#562599]/30 text-xs font-bold px-2.5 py-1 transition cursor-pointer shadow-2xs"
                            title="Subir prueba o comprobante de asistencia para esta sesión (POST /api/sesiones)"
                          >
                            {s.comprobante ? "Actualizar Prueba" : "Subir Prueba"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para Subir Prueba / Marcar Asistencia de la sesión seleccionada */}
      <RegistroAsistenciaModal
        isOpen={Boolean(sesionForPrueba)}
        onClose={() => setSesionForPrueba(null)}
        initialData={sesionForPrueba}
        onRegistrar={handleRegistrarPrueba}
        isLoading={isRegistering}
      />

      {/* Modal para Modificar Fecha de la sesión seleccionada */}
      <EditarFechaSesionModal
        isOpen={Boolean(sesionForFecha)}
        onClose={() => setSesionForFecha(null)}
        sesion={sesionForFecha}
        onSave={handleReprogramarFecha}
        isLoading={isReprogramando}
      />
    </>
  );
}

export default DetalleHitoAdminModal;
