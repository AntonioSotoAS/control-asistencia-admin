import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import type { Usuario } from "../types/usuario.types";

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit?: Usuario | null;
  onSave: (data: Partial<Usuario> & { password?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function UsuarioModal({
  isOpen,
  onClose,
  usuarioToEdit,
  onSave,
  isLoading,
}: UsuarioModalProps) {
  const [identificador, setIdentificador] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Usuario["rol"]>("OPERADOR");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (usuarioToEdit) {
      setIdentificador(usuarioToEdit.identificador || "");
      setNombre(usuarioToEdit.nombre || "");
      setCorreo(usuarioToEdit.correo || "");
      setRol(usuarioToEdit.rol || "OPERADOR");
      setActivo(usuarioToEdit.activo ?? true);
      setPassword("");
    } else {
      setIdentificador("");
      setNombre("");
      setCorreo("");
      setPassword("");
      setRol("OPERADOR");
      setActivo(true);
    }
  }, [usuarioToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      identificador,
      nombre,
      correo,
      rol,
      activo,
      ...(password ? { password } : {}),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={usuarioToEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}
      description="Asigna credenciales, rol y estado de acceso para el personal."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            type="submit"
          >
            {usuarioToEdit ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Identificador / Usuario"
            placeholder="Ej. operador.norte"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            disabled={Boolean(usuarioToEdit)}
            required
          />

          <Input
            label="Nombre Completo"
            placeholder="Ej. Jorge Ramírez Soria"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="usuario@institucion.gob.pe"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <Input
            label={usuarioToEdit ? "Nueva Contraseña (opcional)" : "Contraseña"}
            type="password"
            placeholder={usuarioToEdit ? "Dejar vacío para no cambiar" : "••••••••"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!usuarioToEdit}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-carbon">
              Rol en el Sistema
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as Usuario["rol"])}
              className="w-full rounded-field border border-linea bg-white px-4 py-2.5 text-sm text-carbon font-semibold focus:border-guinda focus:outline-none"
            >
              <option value="OPERADOR">OPERADOR (Registro y Marcaciones)</option>
              <option value="SUPERVISOR">SUPERVISOR (Revisión y Aprobaciones)</option>
              <option value="ADMIN">ADMINISTRADOR (Acceso Total)</option>
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-carbon">
              Estado de la Cuenta
            </label>
            <div className="flex items-center gap-4 pt-3">
              <label className="flex items-center gap-2 text-xs font-bold text-carbon cursor-pointer">
                <input
                  type="radio"
                  name="user_activo"
                  checked={activo}
                  onChange={() => setActivo(true)}
                  className="accent-guinda"
                />
                Activo
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-carbon cursor-pointer">
                <input
                  type="radio"
                  name="user_activo"
                  checked={!activo}
                  onChange={() => setActivo(false)}
                  className="accent-guinda"
                />
                Inactivo
              </label>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
