import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Usuario, ApiErrorResponse } from "../types/usuario.types";

interface EliminarUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onConfirm: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export function EliminarUsuarioModal({
  isOpen,
  onClose,
  usuario,
  onConfirm,
  isLoading,
}: EliminarUsuarioModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!usuario) return null;

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await onConfirm(usuario.id);
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "No se pudo eliminar la cuenta de usuario.";
      setErrorMessage(msg);
    }
  };

  const nombrePersona =
    usuario.persona?.nombres && usuario.persona?.apellidos
      ? `${usuario.persona.nombres} ${usuario.persona.apellidos}`
      : usuario.nombre || usuario.identificador;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Cuenta de Usuario"
      description="Esta acción desvinculará y eliminará el acceso del usuario al sistema."
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
            Eliminar Cuenta
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-tile bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Advertencia de seguridad:</p>
            <p className="text-rose-800 leading-relaxed">
              La persona registrada en el padrón se conservará. No se puede
              eliminar la propia cuenta en sesión ni al único administrador del
              sistema.
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
            <span className="text-olivo font-bold">Identificador: </span>
            <span className="font-mono font-bold text-carbon">
              {usuario.identificador}
            </span>
          </div>
          <div>
            <span className="text-olivo font-bold">Persona vinculada: </span>
            <span className="font-bold text-carbon">{nombrePersona}</span>
          </div>
          <div>
            <span className="text-olivo font-bold">Rol: </span>
            <span className="font-bold text-guinda uppercase">{usuario.rol}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
