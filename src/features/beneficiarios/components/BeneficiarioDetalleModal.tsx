import { Modal, Badge, Button } from "@/components/ui";
import {
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Phone,
  Mail,
  Shield,
  FileCheck,
  MessageSquare,
  Activity,
} from "lucide-react";
import type { Beneficiario, SeguimientoTipo } from "../types/beneficiario.types";

interface BeneficiarioDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiario: Beneficiario | null;
}

export function getSeguimientoBadgeConfig(seguimiento?: SeguimientoTipo | string | null): {
  label: string;
  variant: "info" | "success" | "warning" | "danger" | "olivo" | "default";
  icon: React.ComponentType<{ className?: string }>;
} {
  switch (seguimiento) {
    case "cumple":
      return { label: "Cumple", variant: "success", icon: CheckCircle2 };
    case "alerta":
      return { label: "En Alerta", variant: "warning", icon: AlertTriangle };
    case "incumplimiento":
      return { label: "Incumplimiento", variant: "danger", icon: XCircle };
    case "culminado":
      return { label: "Culminado", variant: "info", icon: CheckCircle2 };
    case "en_curso":
    default:
      return { label: "En Curso", variant: "info", icon: Clock };
  }
}

export function BeneficiarioDetalleModal({
  isOpen,
  onClose,
  beneficiario,
}: BeneficiarioDetalleModalProps) {
  if (!beneficiario) return null;

  const seguimientoConfig = getSeguimientoBadgeConfig(beneficiario.seguimiento);
  const SeguimientoIcon = seguimientoConfig.icon;
  const hito = beneficiario.hito;
  const isActivo = beneficiario.usuario?.estado === "activo";

  const cleanPhone = (beneficiario.telefono || "").replace(/\D/g, "");
  const whatsappUrl = cleanPhone ? `https://wa.me/51${cleanPhone}` : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Integral del Beneficiario"
      description="Expediente judicial, progreso del hito y estado de seguimiento"
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-olivo/70 font-mono">
            ID #{beneficiario.id} • DNI: {beneficiario.dni}
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Ficha
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Profile Summary */}
        <div className="bg-suave/50 border border-linea rounded-tile p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-guinda text-white flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
              {beneficiario.nombre ? beneficiario.nombre.charAt(0).toUpperCase() : "B"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-carbon tracking-tight">
                  {beneficiario.nombre}
                </h3>
                <Badge variant={isActivo ? "success" : "danger"} className="text-[11px]">
                  {isActivo ? "Cuenta Activa" : "Cuenta Inactiva"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-olivo mt-1">
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-linea text-carbon">
                  DNI: {beneficiario.dni}
                </span>
                {beneficiario.usuario?.identificador && (
                  <span>Usuario: {beneficiario.usuario.identificador}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <Badge variant={seguimientoConfig.variant} className="px-3 py-1 font-bold">
              <SeguimientoIcon className="w-3.5 h-3.5 mr-1 inline-block" />
              {seguimientoConfig.label}
            </Badge>
          </div>
        </div>

        {/* Datos Judiciales y Expediente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-linea rounded-tile p-4 space-y-3 bg-white">
            <div className="flex items-center gap-2 text-carbon font-extrabold text-sm border-b border-linea pb-2">
              <FileText className="w-4 h-4 text-guinda" />
              <span>Causa Judicial y Expediente</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-olivo block text-[11px] font-semibold uppercase">
                  Número de Expediente
                </span>
                <span className="font-mono font-bold text-carbon text-sm">
                  {beneficiario.expediente || "Sin expediente registrado"}
                </span>
              </div>
              <div>
                <span className="text-olivo block text-[11px] font-semibold uppercase">
                  Juzgado a Cargo
                </span>
                <span className="font-semibold text-carbon flex items-start gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-olivo shrink-0 mt-0.5" />
                  {beneficiario.juzgado || "No especificado"}
                </span>
              </div>
              <div>
                <span className="text-olivo block text-[11px] font-semibold uppercase">
                  Consentimiento Informado Digital
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {beneficiario.consentimiento_aceptado ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      <FileCheck className="w-3.5 h-3.5" />
                      Aceptado{" "}
                      {beneficiario.consentimiento_fecha
                        ? `(${new Date(beneficiario.consentimiento_fecha).toLocaleDateString("es-PE")})`
                        : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Pendiente de firma
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contacto y Comunicación Directa */}
          <div className="border border-linea rounded-tile p-4 space-y-3 bg-white">
            <div className="flex items-center gap-2 text-carbon font-extrabold text-sm border-b border-linea pb-2">
              <Phone className="w-4 h-4 text-guinda" />
              <span>Canales de Contacto</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-olivo block text-[11px] font-semibold uppercase">
                  Teléfono / Móvil
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-carbon text-sm">
                    {beneficiario.telefono || "Sin teléfono registrado"}
                  </span>
                  {beneficiario.telefono && (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${beneficiario.telefono}`}
                        className="px-2 py-1 rounded bg-suave hover:bg-linea text-carbon font-bold text-[11px] inline-flex items-center gap-1 transition"
                        title="Llamar"
                      >
                        <Phone className="w-3 h-3 text-olivo" />
                        Llamar
                      </a>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1 transition"
                          title="Enviar WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-olivo block text-[11px] font-semibold uppercase">
                  Correo Electrónico
                </span>
                <span className="font-semibold text-carbon flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-olivo shrink-0" />
                  {beneficiario.email || "Sin correo registrado"}
                </span>
              </div>
              <div>
                <span className="text-olivo block text-[11px] font-semibold uppercase">
                  Rol y Seguridad
                </span>
                <span className="font-semibold text-carbon flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-olivo shrink-0" />
                  Rol: {beneficiario.usuario?.rol || "beneficiario"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hito Activo y Control de Asistencias */}
        <div className="border border-linea rounded-tile p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-linea pb-2">
            <div className="flex items-center gap-2 text-carbon font-extrabold text-sm">
              <Activity className="w-4 h-4 text-guinda" />
              <span>Hito Activo de Control y Asistencia</span>
            </div>
            {hito && (
              <Badge
                variant={hito.completado ? "success" : "info"}
                className="text-[11px] font-bold"
              >
                {hito.completado ? "Hito Completado" : "En Seguimiento"}
              </Badge>
            )}
          </div>

          {hito ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-carbon text-sm">{hito.titulo}</h4>
                  {hito.fecha && (
                    <p className="text-xs text-olivo flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-olivo" />
                      Fecha límite:{" "}
                      <span className="font-semibold text-carbon">
                        {new Date(hito.fecha).toLocaleDateString("es-PE", {
                          weekday: "short",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-guinda">
                    {hito.asistencias} / {hito.sesiones_requeridas}
                  </span>
                  <span className="text-xs text-olivo block font-medium">
                    sesiones asistidas ({hito.progreso}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-suave rounded-full h-3 overflow-hidden border border-linea">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      hito.progreso >= 100
                        ? "bg-emerald-600"
                        : hito.progreso >= 50
                        ? "bg-guinda"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, hito.progreso))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-olivo font-semibold">
                  <span>0 asistencias</span>
                  <span>Meta: {hito.sesiones_requeridas} asistencias</span>
                </div>
              </div>

              {hito.revision && (
                <div className="p-3 bg-suave/60 rounded-field border border-linea/80 text-xs text-carbon">
                  <span className="font-bold block text-olivo text-[11px]">
                    Observaciones de Revisión Judicial:
                  </span>
                  <p className="mt-0.5 italic">{hito.revision}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-olivo bg-suave/30 rounded-field border border-linea/60">
              <Calendar className="w-8 h-8 text-olivo/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-carbon">
                No registra hito activo en este momento
              </p>
              <p className="text-[11px] text-olivo mt-0.5">
                Los hitos y sesiones de control pueden ser configurados en el módulo de Hitos.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
