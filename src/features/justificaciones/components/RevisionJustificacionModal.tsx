import { useState, useEffect } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import { CheckCircle, XCircle, FileText, User, Calendar, Flag } from "lucide-react";
import type { Justificacion, ResponderJustificacionPayload } from "../types/justificacion.types";

interface RevisionJustificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  justificacion: Justificacion | null;
  onResponder: (payload: ResponderJustificacionPayload) => Promise<void>;
  isLoading?: boolean;
}

export function RevisionJustificacionModal({
  isOpen,
  onClose,
  justificacion,
  onResponder,
  isLoading,
}: RevisionJustificacionModalProps) {
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    if (justificacion) {
      setObservacion(justificacion.respuestaObservacion || "");
    }
  }, [justificacion, isOpen]);

  if (!justificacion) return null;

  const handleAction = async (estado: "APROBADA" | "RECHAZADA") => {
    await onResponder({
      id: justificacion.id,
      estado,
      respuestaObservacion: observacion,
    });
    onClose();
  };

  const isPending = justificacion.estado === "PENDIENTE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revisión de Solicitud de Justificación"
      description={`Solicitud #${justificacion.id} • Presentada el ${justificacion.fechaSolicitud}`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cerrar
          </Button>
          {isPending && (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleAction("RECHAZADA")}
                isLoading={isLoading}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Rechazar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction("APROBADA")}
                isLoading={isLoading}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Aprobar Justificación
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Beneficiary Info box */}
        <div className="p-4 rounded-tile bg-suave/80 border border-linea/80 space-y-2">
          <div className="flex items-center gap-2 text-xs text-carbon">
            <User className="w-4 h-4 text-olivo" />
            <span className="font-bold">{justificacion.beneficiarioNombre}</span>
            <span className="text-olivo font-mono">({justificacion.beneficiarioDni})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-carbon">
            <Flag className="w-4 h-4 text-olivo" />
            <span>Hito: <strong className="font-semibold">{justificacion.hitoNombre}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-carbon">
            <Calendar className="w-4 h-4 text-olivo" />
            <span>Fecha de la inasistencia: <strong className="font-semibold">{justificacion.fechaSolicitud}</strong></span>
          </div>
        </div>

        {/* Motivo */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Motivo de Inasistencia Declarado
          </label>
          <div className="p-3.5 rounded-field bg-white border border-linea text-xs text-carbon font-medium leading-relaxed">
            {justificacion.motivo}
          </div>
        </div>

        {/* Documento adjunto */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Documento Probatorio
          </label>
          <div className="flex items-center justify-between p-3 rounded-field bg-white border border-linea text-xs">
            <div className="flex items-center gap-2 text-olivo">
              <FileText className="w-4 h-4 text-guinda" />
              <span className="font-medium">Certificado_Medico_FirmaDigital.pdf</span>
            </div>
            <Badge variant="guinda">Adjunto Válido</Badge>
          </div>
        </div>

        {/* Estado actual */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-olivo">Estado Actual:</span>
          <Badge
            variant={
              justificacion.estado === "APROBADA"
                ? "success"
                : justificacion.estado === "RECHAZADA"
                ? "danger"
                : "warning"
            }
          >
            {justificacion.estado}
          </Badge>
        </div>

        {/* Observaciones dictamen */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Dictamen u Observaciones del Supervisor
          </label>
          <textarea
            rows={2}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            disabled={!isPending}
            placeholder={
              isPending
                ? "Agrega un comentario de resolución para el beneficiario..."
                : "Sin observaciones adicionales registradas."
            }
            className="w-full rounded-field border border-linea bg-white px-4 py-2 text-xs text-carbon placeholder:text-carbon/40 focus:border-guinda focus:outline-none disabled:bg-suave/50"
          />
        </div>
      </div>
    </Modal>
  );
}
