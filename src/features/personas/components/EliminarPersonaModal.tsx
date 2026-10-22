import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Persona, ApiErrorResponse } from "../types/persona.types";

interface EliminarPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: Persona | null;
  onConfirm: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export function EliminarPersonaModal({
  isOpen,
  onClose,
  persona,
  onConfirm,
  isLoading,
}: EliminarPersonaModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!persona) return null;

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await onConfirm(persona.id);
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "No se pudo eliminar la persona.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Registro de Persona"
      description="Esta acción eliminará permanentemente a la persona y sus registros asociados."
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isLoading}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Eliminar Persona
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-tile bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Advertencia importante del sistema:</p>
            <p className="text-rose-800 leading-relaxed">
              Al eliminar la persona también se eliminará su cuenta de usuario,
              su hito, sus sesiones y sus justificaciones asociadas. No se puede
              eliminar la propia persona en sesión ni al único administrador.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-field bg-red-100 border border-red-300 text-red-800 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="p-4 rounded-tile bg-suave/80 border border-linea text-xs space-y-1.5">
          <div>
            <span className="text-olivo font-bold">Nombre: </span>
            <span className="font-bold text-carbon">{persona.nombre}</span>
          </div>
          <div>
            <span className="text-olivo font-bold">DNI: </span>
            <span className="font-mono font-bold text-carbon">{persona.dni}</span>
          </div>
          {persona.expediente && (
            <div>
              <span className="text-olivo font-bold">Expediente: </span>
              <span className="font-mono text-carbon">{persona.expediente}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
