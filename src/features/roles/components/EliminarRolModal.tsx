import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { Rol, ApiErrorResponse } from "../types/rol.types";

interface EliminarRolModalProps {
  isOpen: boolean;
  onClose: () => void;
  rol: Rol | null;
  onConfirm: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export function EliminarRolModal({
  isOpen,
  onClose,
  rol,
  onConfirm,
  isLoading,
}: EliminarRolModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!rol) return null;

  const handleDelete = async () => {
    setErrorMessage(null);
    try {
      await onConfirm(rol.id);
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "No se pudo eliminar el rol. Comprueba que no sea un rol protegido o esté asignado a usuarios.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Rol de Acceso"
      description="Esta acción eliminará el rol del catálogo de permisos."
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
            Eliminar Rol
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-tile bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Restricción de seguridad:</p>
            <p className="text-rose-800 leading-relaxed">
              Solo un superadministrador puede eliminar roles. No se puede eliminar
              un rol del sistema ni aquellos que se encuentren asignados a cuentas
              de usuario activas.
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
            <span className="text-olivo font-bold">Código del rol: </span>
            <span className="font-mono font-bold text-carbon">{rol.codigo}</span>
          </div>
          <div>
            <span className="text-olivo font-bold">Nombre descriptivo: </span>
            <span className="font-bold text-carbon">{rol.nombre}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
