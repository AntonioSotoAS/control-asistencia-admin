import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { Eye, EyeOff, Search, UserCheck, AlertCircle } from "lucide-react";
import { useGetPersonasQuery, type Persona } from "@/features/personas";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type {
  Usuario,
  RolUsuario,
  EstadoUsuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
  PersonaInfo,
  ApiErrorResponse,
} from "../types/usuario.types";

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioToEdit?: Usuario | null;
  onSaveCreate: (data: CrearUsuarioPayload) => Promise<void>;
  onSaveUpdate: (data: ActualizarUsuarioPayload) => Promise<void>;
  isLoading?: boolean;
}

const ROLES_DISPONIBLES: { value: RolUsuario; label: string; desc: string }[] = [
  { value: "superadmin", label: "Superadministrador", desc: "Acceso total y gestión global" },
  { value: "admin", label: "Administrador", desc: "Gestión de sesiones, hitos y usuarios" },
  { value: "asistente", label: "Asistente / Operador", desc: "Registro y marcación de asistencias" },
  { value: "beneficiario", label: "Beneficiario", desc: "Consulta de sus asistencias y sesiones" },
  { value: "juez", label: "Juez / Supervisor", desc: "Supervisión y revisión de cumplimiento" },
];

export function UsuarioModal({
  isOpen,
  onClose,
  usuarioToEdit,
  onSaveCreate,
  onSaveUpdate,
  isLoading,
}: UsuarioModalProps) {
  const [personaId, setPersonaId] = useState<number | "">("");
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolUsuario>("asistente");
  const [estado, setEstado] = useState<EstadoUsuario>("activo");
  const [showPassword, setShowPassword] = useState(false);

  // Selector / buscador de personas
  const [searchPersona, setSearchPersona] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<Persona | PersonaInfo | null>(null);
  const debouncedSearchPersona = useDebounce(searchPersona, 350);

  const { data: personasEncontradas, isFetching: isSearchingPersonas } =
    useGetPersonasQuery(debouncedSearchPersona, {
      skip: !isOpen || Boolean(usuarioToEdit),
    });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    setErrorMessage(null);
    setFieldErrors({});
    setShowPassword(false);

    if (usuarioToEdit) {
      setPersonaId(usuarioToEdit.persona_id);
      setIdentificador(usuarioToEdit.identificador || "");
      setPassword("");
      setRol(usuarioToEdit.rol || "asistente");
      setEstado(usuarioToEdit.estado || "activo");
      setSelectedPersona(usuarioToEdit.persona || null);
      setSearchPersona("");
    } else {
      setPersonaId("");
      setIdentificador("");
      setPassword("");
      setRol("asistente");
      setEstado("activo");
      setSelectedPersona(null);
      setSearchPersona("");
    }
  }, [usuarioToEdit, isOpen]);

  const handleSelectPersona = (p: Persona) => {
    setSelectedPersona(p);
    setPersonaId(p.id);
    // Sugerir identificador si está vacío (por ejemplo su DNI o expediente)
    if (!identificador && (p.dni || p.expediente)) {
      setIdentificador(p.dni || p.expediente || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!personaId) {
      setErrorMessage("Debes vincular una persona existente para este usuario.");
      return;
    }

    if (!identificador.trim()) {
      setErrorMessage("El identificador es obligatorio.");
      return;
    }

    try {
      if (usuarioToEdit) {
        const payload: ActualizarUsuarioPayload = {
          id: usuarioToEdit.id,
          persona_id: Number(personaId),
          identificador: identificador.trim(),
          rol,
          estado,
          ...(password ? { password } : {}),
        };
        await onSaveUpdate(payload);
      } else {
        if (!password) {
          setErrorMessage("La contraseña es requerida para un nuevo usuario.");
          return;
        }
        const payload: CrearUsuarioPayload = {
          persona_id: Number(personaId),
          identificador: identificador.trim(),
          password,
          rol,
          estado,
        };
        await onSaveCreate(payload);
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
        "Error al procesar la solicitud en el servidor.";
      setErrorMessage(mainMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={usuarioToEdit ? `Editar Usuario #${usuarioToEdit.id}` : "Crear Cuenta de Acceso"}
      description={
        usuarioToEdit
          ? "Actualiza la cuenta de acceso, rol o estado del usuario."
          : "La persona debe existir previamente en el sistema y no tener otra cuenta asignada."
      }
      maxWidth="lg"
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
            {usuarioToEdit ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* Sección: Vincular Persona */}
        <div className="p-4 rounded-tile bg-suave/50 border border-linea space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-guinda" />
              Persona Vinculada (persona_id: {personaId || "sin asignar"})
            </label>
            {selectedPersona && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Persona Seleccionada
              </span>
            )}
          </div>

          {selectedPersona ? (
            <div className="flex items-center justify-between p-3 rounded-field bg-white border border-linea text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-carbon">
                  {selectedPersona.nombre || `Persona #${selectedPersona.id}`}
                </p>
                <p className="text-[11px] text-olivo">
                  DNI: {selectedPersona.dni || "S/N"} • ID: #{selectedPersona.id}
                  {selectedPersona.expediente ? ` • Exp: ${selectedPersona.expediente}` : ""}
                </p>
              </div>
              {!usuarioToEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPersona(null);
                    setPersonaId("");
                  }}
                  className="text-xs font-semibold text-guinda hover:underline cursor-pointer"
                >
                  Cambiar
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar persona por nombre, DNI o expediente..."
                  value={searchPersona}
                  onChange={(e) => setSearchPersona(e.target.value)}
                  className="w-full text-xs bg-white border border-linea rounded-field pl-10 pr-4 py-2 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda"
                />
              </div>

              {isSearchingPersonas && (
                <p className="text-[11px] text-olivo italic">Buscando personas...</p>
              )}

              {personasEncontradas && personasEncontradas.length > 0 ? (
                <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2 rounded-field border border-linea">
                  {personasEncontradas.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className="w-full text-left p-2 rounded-md hover:bg-suave flex items-center justify-between text-xs transition cursor-pointer"
                    >
                      <span className="font-bold text-carbon">
                        {p.nombre}
                      </span>
                      <span className="text-[11px] font-mono text-olivo">
                        DNI: {p.dni || "—"} (ID: #{p.id})
                      </span>
                    </button>
                  ))}
                </div>
              ) : debouncedSearchPersona ? (
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-olivo">
                    No se encontraron personas con esa búsqueda. También puedes ingresar el ID numérico directo:
                  </p>
                  <input
                    type="number"
                    placeholder="ID Persona"
                    value={personaId}
                    onChange={(e) => setPersonaId(Number(e.target.value) || "")}
                    className="w-24 text-xs font-mono bg-white border border-linea rounded-field px-2.5 py-1 text-carbon"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Identificador y Contraseña */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Identificador / Login (DNI o Usuario)"
            placeholder="Ej. 12345678 o admin.central"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            required
            error={fieldErrors.identificador?.[0]}
          />

          <Input
            label={usuarioToEdit ? "Contraseña (opcional)" : "Contraseña"}
            type={showPassword ? "text" : "password"}
            placeholder={usuarioToEdit ? "Dejar en blanco para no cambiar" : "ClaveSegura1"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!usuarioToEdit}
            error={fieldErrors.password?.[0]}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-carbon cursor-pointer transition p-1 text-olivo/80 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />
        </div>

        {/* Rol y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-carbon">
              Rol del Usuario
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as RolUsuario)}
              className="w-full rounded-field border border-linea bg-white px-4 py-2.5 text-sm text-carbon font-semibold focus:border-guinda focus:outline-none cursor-pointer"
            >
              {ROLES_DISPONIBLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} ({r.value})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-olivo">
              {ROLES_DISPONIBLES.find((r) => r.value === rol)?.desc}
            </p>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-carbon">
              Estado de la Cuenta
            </label>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-carbon cursor-pointer">
                <input
                  type="radio"
                  name="estado_cuenta"
                  value="activo"
                  checked={estado === "activo"}
                  onChange={() => setEstado("activo")}
                  className="accent-guinda w-4 h-4"
                />
                Activo
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-carbon cursor-pointer">
                <input
                  type="radio"
                  name="estado_cuenta"
                  value="inactivo"
                  checked={estado === "inactivo"}
                  onChange={() => setEstado("inactivo")}
                  className="accent-guinda w-4 h-4"
                />
                Inactivo
              </label>
            </div>
            <p className="text-[11px] text-olivo pt-1">
              Si pasa a inactivo, se revocarán automáticamente sus tokens activos.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
