import { Modal, Button, Badge } from "@/components/ui";
import {
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Building2,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import type { AlertaInasistencia } from "../types/dashboard.types";

interface FichaContactoModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerta: AlertaInasistencia | null;
  onRegistrarJustificacion?: (alerta: AlertaInasistencia) => void;
}

export function FichaContactoModal({
  isOpen,
  onClose,
  alerta,
  onRegistrarJustificacion,
}: FichaContactoModalProps) {
  if (!alerta) return null;

  const isFalta = alerta.tipo === "FALTA";
  const cleanPhone = alerta.telefono ? alerta.telefono.replace(/\D/g, "") : "";

  // Mensaje predeterminado de WhatsApp para el beneficiario
  const whatsappMessage = encodeURIComponent(
    `Estimado(a) ${alerta.nombre}, le escribimos del Área de Control de Asistencia respecto a su ${isFalta ? "inasistencia (falta)" : "tardanza"
    } registrada el día ${alerta.fecha} en la sesión (${alerta.hitoNombre}). Le recordamos que es necesario regularizar o justificar su asistencia para el cumplimiento de sus compromisos institucionales.`
  );

  const whatsappUrl = cleanPhone
    ? `https://wa.me/51${cleanPhone}?text=${whatsappMessage}`
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Rápida y Contacto Directo"
      description="Datos completos del beneficiario para comunicación inmediata y seguimiento operativo."
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          {onRegistrarJustificacion && alerta.estadoJustificacion === "SIN_JUSTIFICAR" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onRegistrarJustificacion(alerta);
              }}
              leftIcon={<FileText className="w-4 h-4 text-guinda" />}
            >
              Registrar Justificación
            </Button>
          ) : (
            <div />
          )}

          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Cabecera del Beneficiario */}
        <div className="p-4 rounded-tile bg-suave/80 border border-linea space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-guinda text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                {alerta.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-extrabold text-base text-carbon tracking-tight leading-snug">
                  {alerta.nombre}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs font-semibold text-olivo bg-white px-2 py-0.5 rounded border border-linea/60">
                    DNI: {alerta.dni}
                  </span>
                  {alerta.seguimiento && (
                    <Badge variant="olivo">{alerta.seguimiento}</Badge>
                  )}
                </div>
              </div>
            </div>

            <Badge variant={isFalta ? "danger" : "warning"} className="gap-1">
              {isFalta ? (
                <AlertOctagon className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {isFalta ? "INASISTENCIA" : "TARDANZA"}
            </Badge>
          </div>

          {/* Estado de Justificación */}
          <div className="flex items-center justify-between pt-2 border-t border-linea/60 text-xs">
            <span className="text-olivo font-semibold">Condición del incidente:</span>
            {alerta.estadoJustificacion === "JUSTIFICADA" ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Justificada formalmente
              </span>
            ) : alerta.estadoJustificacion === "PENDIENTE" ? (
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                Justificación en trámite
              </span>
            ) : (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
                Sin justificación presentada
              </span>
            )}
          </div>
        </div>

        {/* Canales de Contacto Directo */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-carbon block">
            Acciones de Comunicación Inmediata
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-tile bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Enviar WhatsApp Directo</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
              </a>
            ) : (
              <div className="p-3.5 rounded-tile bg-suave/60 border border-linea text-xs text-olivo flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-olivo/50" />
                <span>WhatsApp no disponible (sin teléfono)</span>
              </div>
            )}

            {/* Llamada */}
            {cleanPhone ? (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-between p-3.5 rounded-tile bg-white border border-linea hover:border-guinda/60 hover:bg-suave text-carbon font-bold text-xs transition"
              >
                <div className="flex items-center gap-2.5 text-guinda">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span className="text-carbon font-mono">Llamar: {alerta.telefono}</span>
                </div>
              </a>
            ) : (
              <div className="p-3.5 rounded-tile bg-suave/60 border border-linea text-xs text-olivo flex items-center gap-2">
                <Phone className="w-4 h-4 text-olivo/50" />
                <span>Sin teléfono de contacto</span>
              </div>
            )}
          </div>

          {/* Correo Electrónico */}
          {alerta.email && (
            <a
              href={`mailto:${alerta.email}?subject=Notificación de Control de Asistencia - Inasistencia`}
              className="flex items-center justify-between p-3 rounded-field bg-white border border-linea hover:border-guinda/60 text-xs transition"
            >
              <div className="flex items-center gap-2 text-olivo">
                <Mail className="w-4 h-4 text-guinda" />
                <span className="text-carbon font-medium">{alerta.email}</span>
              </div>
              <span className="text-guinda font-bold text-[11px] hover:underline">
                Redactar correo
              </span>
            </a>
          )}
        </div>

        {/* Datos Judiciales y Expediente */}
        <div className="p-4 rounded-tile bg-white border border-linea space-y-2 text-xs">
          <label className="font-bold text-carbon block border-b border-linea/60 pb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-guinda" />
            Información Judicial y Expediente
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-olivo font-semibold block">Expediente:</span>
              <span className="font-mono font-bold text-carbon">
                {alerta.expediente || "No consignado"}
              </span>
            </div>
            <div>
              <span className="text-olivo font-semibold block">Juzgado asignado:</span>
              <span className="font-bold text-carbon">
                {alerta.juzgado || "Juzgado no especificado"}
              </span>
            </div>
          </div>
        </div>

        {/* Detalle del Incidente */}
        <div className="p-4 rounded-tile bg-white border border-linea space-y-2 text-xs">
          <label className="font-bold text-carbon block border-b border-linea/60 pb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-guinda" />
            Detalle de la Sesión / Hito
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-olivo font-semibold block">Hito o Actividad:</span>
              <span className="font-bold text-carbon">{alerta.hitoNombre}</span>
            </div>
            <div>
              <span className="text-olivo font-semibold block">Fecha y Hora de la falta:</span>
              <span className="font-bold text-carbon flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-olivo" />
                {alerta.fecha} {alerta.hora && alerta.hora !== "—" ? `(${alerta.hora})` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
