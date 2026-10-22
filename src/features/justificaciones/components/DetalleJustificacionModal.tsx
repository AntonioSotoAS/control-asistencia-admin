import { Modal, Button, Badge } from "@/components/ui";
import {
  FileText,
  User,
  Calendar,
  ExternalLink,
  Tag,
  AlertCircle,
} from "lucide-react";
import type { Justificacion } from "../types/justificacion.types";

interface DetalleJustificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  justificacion: Justificacion | null;
}

export function DetalleJustificacionModal({
  isOpen,
  onClose,
  justificacion,
}: DetalleJustificacionModalProps) {
  if (!justificacion) return null;

  const isApproved = justificacion.estado === "APROBADA";
  const isRejected = justificacion.estado === "RECHAZADA";

  const fileUrl = justificacion.sustentoDocUrl || justificacion.archivo_url || justificacion.archivo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Justificación #${justificacion.id}`}
      description={`Registrada para el día ${justificacion.fecha || justificacion.fechaSolicitud}`}
      maxWidth="md"
      footer={
        <Button variant="outline" size="sm" onClick={onClose} type="button">
          Cerrar
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Beneficiario y Sesión */}
        <div className="p-4 rounded-tile bg-suave/80 border border-linea/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-carbon">
              <User className="w-4 h-4 text-olivo" />
              <span className="font-bold">
                {justificacion.beneficiarioNombre || "Beneficiario"}
              </span>
              <span className="text-olivo font-mono">
                ({justificacion.beneficiarioDni || "S/D"})
              </span>
            </div>

            <Badge
              variant={
                isApproved
                  ? "success"
                  : isRejected
                  ? "danger"
                  : "warning"
              }
            >
              {justificacion.estado || "PENDIENTE"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-carbon">
            <Tag className="w-4 h-4 text-olivo" />
            <span>
              Hito / Sesión:{" "}
              <strong className="font-semibold text-carbon">
                {justificacion.hitoNombre ||
                  (justificacion.sesion_id
                    ? `Sesión #${justificacion.sesion_id}`
                    : "Inasistencia General")}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-carbon">
            <Calendar className="w-4 h-4 text-olivo" />
            <span>
              Fecha de la falta:{" "}
              <strong className="font-semibold text-carbon">
                {justificacion.fecha || justificacion.fechaSolicitud}
              </strong>
            </span>
          </div>
        </div>

        {/* Motivo */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-carbon">
            Motivo de Inasistencia
          </label>
          <div className="p-3.5 rounded-field bg-white border border-linea text-xs text-carbon font-medium leading-relaxed whitespace-pre-wrap">
            {justificacion.motivo || "Sin motivo detallado."}
          </div>
        </div>

        {/* Documento probatorio */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-carbon">
            Documento de Sustento
          </label>
          {fileUrl ? (
            <div className="flex items-center justify-between p-3.5 rounded-field bg-white border border-linea text-xs">
              <div className="flex items-center gap-2 text-carbon">
                <FileText className="w-4 h-4 text-guinda shrink-0" />
                <span className="font-semibold truncate max-w-[240px]">
                  {fileUrl.split("/").pop() || "Archivo_Sustento.pdf"}
                </span>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-guinda hover:underline"
              >
                Abrir Sustento
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-3 rounded-field bg-suave/60 border border-linea/70 text-xs text-olivo flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-olivo/70 shrink-0" />
              <span>No se adjuntó ningún documento físico o digital a esta solicitud.</span>
            </div>
          )}
        </div>

        {/* Observaciones / Dictamen */}
        {justificacion.observacion && (
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-carbon">
              Observaciones Registradas
            </label>
            <div className="p-3.5 rounded-field bg-amber-50/70 border border-amber-200 text-xs text-amber-900 font-medium">
              {justificacion.observacion}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
