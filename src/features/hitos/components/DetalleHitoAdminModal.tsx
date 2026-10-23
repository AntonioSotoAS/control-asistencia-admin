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
} from "lucide-react";
import { useGetHitoAdminByIdQuery } from "../services/hitosApi";
import type { HitoAdmin } from "../types/hito.types";

interface DetalleHitoAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  hitoId: number | null;
  onAgendarFechas?: (hito: HitoAdmin) => void;
  onRevisar?: (hito: HitoAdmin) => void;
}

export function DetalleHitoAdminModal({
  isOpen,
  onClose,
  hitoId,
  onAgendarFechas,
  onRevisar,
}: DetalleHitoAdminModalProps) {
  const { data: hito, isLoading } = useGetHitoAdminByIdQuery(hitoId!, {
    skip: !isOpen || !hitoId,
  });

  if (!isOpen) return null;

  const persona = hito?.persona;
  const sesiones = hito?.sesiones || [];
  const total = hito?.sesiones_totales || hito?.sesiones_count || sesiones.length || 0;
  const asistidas = hito?.sesiones_completadas || hito?.asistencias_count || 0;
  const porcentaje = hito?.porcentaje_avance ?? 0;

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

  return (
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
                Agendar Fechas
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
                  <strong className="font-mono">{persona?.expediente || "Sin expediente"}</strong>
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
                <strong className="text-carbon">{hito.fecha_hito || hito.fecha || "No definida"}</strong>
              </span>
              <span className="font-extrabold text-carbon">
                {asistidas} de {total} sesiones cumplidas ({porcentaje}%)
              </span>
            </div>

            <div className="w-full h-2.5 bg-suave rounded-full overflow-hidden border border-linea/40">
              <div
                className={`h-full rounded-full transition-all duration-300 ${porcentaje >= 100
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

          {/* Sesiones del Hito */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-carbon">
              Sesiones Programadas y Asistencia ({sesiones.length})
            </h5>

            {sesiones.length === 0 ? (
              <div className="p-6 rounded-tile bg-suave/40 border border-linea text-center text-xs text-olivo">
                Este beneficiario no tiene sesiones agendadas para su hito.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {sesiones.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="flex items-center justify-between p-3 rounded-field bg-white border border-linea text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-suave flex items-center justify-center font-mono font-bold text-olivo text-[11px]">
                        #{s.numero ?? idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-carbon">
                            {s.fecha}
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
                          <div className="mt-0.5">
                            {s.comprobante_url ? (
                              <a
                                href={s.comprobante_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-bold text-guinda hover:underline inline-flex items-center gap-1"
                              >
                                📎 Comprobante: {s.comprobante}
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

                    <div className="flex items-center gap-3">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
