import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { AlertCircle, Shield, Info } from "lucide-react";
import {
  esRolProtegido,
  type Rol,
  type CrearRolPayload,
  type ActualizarRolPayload,
  type ApiErrorResponse,
} from "../types/rol.types";

interface RolModalProps {
  isOpen: boolean;
  onClose: () => void;
  rolToEdit?: Rol | null;
  onSaveCreate: (data: CrearRolPayload) => Promise<void>;
  onSaveUpdate: (data: ActualizarRolPayload) => Promise<void>;
  isLoading?: boolean;
}

export function RolModal({
  isOpen,
  onClose,
  rolToEdit,
  onSaveCreate,
  onSaveUpdate,
  isLoading,
}: RolModalProps) {
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isProtected = rolToEdit ? esRolProtegido(rolToEdit.codigo) : false;

  useEffect(() => {
    setErrorMessage(null);
    setFieldErrors({});

    if (rolToEdit) {
      setCodigo(rolToEdit.codigo || "");
      setNombre(rolToEdit.nombre || "");
    } else {
      setCodigo("");
      setNombre("");
    }
  }, [rolToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const cleanCodigo = codigo.toLowerCase().trim();
    const cleanNombre = nombre.trim();

    if (!cleanCodigo) {
      setErrorMessage("El código identificador del rol es requerido.");
      return;
    }

    if (!cleanNombre) {
      setErrorMessage("El nombre descriptivo del rol es requerido.");
      return;
    }

    try {
      if (rolToEdit) {
        await onSaveUpdate({
          id: rolToEdit.id,
          codigo: isProtected ? undefined : cleanCodigo,
          nombre: cleanNombre,
        });
      } else {
        await onSaveCreate({
          codigo: cleanCodigo,
          nombre: cleanNombre,
        });
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const apiErrors = error.data?.errors || {};
      setFieldErrors(apiErrors);
      const mainMsg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "Error al procesar el rol en el servidor.";
      setErrorMessage(mainMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={rolToEdit ? `Editar Rol: ${rolToEdit.nombre}` : "Crear Nuevo Rol de Acceso"}
      description="Los roles definen los perfiles de acceso asignables a los usuarios del sistema."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            type="submit"
          >
            {rolToEdit ? "Guardar Cambios" : "Crear Rol"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-field bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{errorMessage}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                  {Object.entries(fieldErrors).map(([field, msgs]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {msgs.join(", ")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {isProtected && (
          <div className="p-3 rounded-field bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-700 shrink-0" />
            <span>
              Este es un rol base del sistema. Puedes actualizar su nombre visible, pero su código interno está protegido.
            </span>
          </div>
        )}

        <Input
          label="Código del Rol (minúsculas y sin espacios)"
          placeholder="Ej. secretario o coordinador"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toLowerCase().replace(/\s+/g, ""))}
          disabled={isProtected}
          helperText={
            isProtected
              ? "Código protegido por el sistema."
              : "Se guardará automáticamente en minúsculas y no puede repetirse."
          }
          required
          error={fieldErrors.codigo?.[0]}
        />

        <Input
          label="Nombre Descriptivo"
          placeholder="Ej. Secretario Judicial o Coordinador de Sede"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          helperText="Nombre que se mostrará en los selectores y tablas del sistema."
          required
          error={fieldErrors.nombre?.[0]}
        />

        {!rolToEdit && (
          <div className="p-3 rounded-field bg-suave/80 border border-linea text-xs text-olivo flex items-center gap-2">
            <Info className="w-4 h-4 text-olivo shrink-0" />
            <span>
              Nota: Solo los usuarios con rol <strong>Superadmin</strong> pueden crear, editar o eliminar roles.
            </span>
          </div>
        )}
      </form>
    </Modal>
  );
}
