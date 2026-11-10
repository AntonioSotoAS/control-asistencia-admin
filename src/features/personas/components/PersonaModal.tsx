import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { AlertCircle, User, ShieldCheck, Search, CheckCircle2 } from "lucide-react";
import { useBuscarActoPorDocumentoMutation } from "@/features/actos-procesales/services/actosProcesalesApi";
import type {
  Persona,
  CrearPersonaPayload,
  ActualizarPersonaPayload,
  ApiErrorResponse,
} from "../types/persona.types";

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaToEdit?: Persona | null;
  initialDni?: string;
  onSaveCreate: (data: CrearPersonaPayload) => Promise<Persona | void>;
  onSaveUpdate: (data: ActualizarPersonaPayload) => Promise<void>;
  onPersonaCreated?: (persona: Persona) => void;
  isLoading?: boolean;
}

export function PersonaModal({
  isOpen,
  onClose,
  personaToEdit,
  initialDni,
  onSaveCreate,
  onSaveUpdate,
  onPersonaCreated,
  isLoading,
}: PersonaModalProps) {
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [expediente, setExpediente] = useState("");
  const [juzgado, setJuzgado] = useState("");
  const [seguimiento, setSeguimiento] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [buscarActo, { isLoading: isSearchingDni }] = useBuscarActoPorDocumentoMutation();

  useEffect(() => {
    setErrorMessage(null);
    setInfoMessage(null);
    setFieldErrors({});

    if (personaToEdit) {
      setNombre(personaToEdit.nombre || "");
      setDni(personaToEdit.dni || "");
      setEmail(personaToEdit.email || "");
      setTelefono(personaToEdit.telefono || "");
      setExpediente(personaToEdit.expediente || "");
      setJuzgado(personaToEdit.juzgado || "");
      setSeguimiento(personaToEdit.seguimiento || "");
    } else {
      setNombre("");
      setDni(initialDni || "");
      setEmail("");
      setTelefono("");
      setExpediente("");
      setJuzgado("");
      setSeguimiento("en_curso");

      if (initialDni && initialDni.length === 8 && isOpen) {
        handleBuscarDni(initialDni);
      }
    }
  }, [personaToEdit, isOpen, initialDni]);

  const handleBuscarDni = async (docOverride?: string) => {
    const target = (docOverride ?? dni).trim();
    if (!target || target.length !== 8) {
      setErrorMessage("Ingresa un DNI de 8 dígitos para consultar los actos procesales.");
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const data = await buscarActo(target).unwrap();
      if (data) {
        if (data.nombre) setNombre(data.nombre);
        if (data.casos && data.casos.length > 0) {
          if (data.casos[0].expediente) setExpediente(data.casos[0].expediente);
          if (data.casos[0].juzgado) setJuzgado(data.casos[0].juzgado);
        }
        setInfoMessage(`Datos encontrados en actos procesales para ${data.nombre}. Se completaron los campos.`);
      }
    } catch {
      setInfoMessage("No se encontraron actos procesales previos para este DNI. Puedes ingresar los datos manualmente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!nombre.trim()) {
      setErrorMessage("El nombre completo es requerido.");
      return;
    }

    if (!dni.trim() || dni.trim().length !== 8) {
      setErrorMessage("El DNI debe contener 8 dígitos numéricos.");
      return;
    }

    try {
      if (personaToEdit) {
        const payload: ActualizarPersonaPayload = {
          id: personaToEdit.id,
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          expediente: expediente.trim() || undefined,
          juzgado: juzgado.trim() || undefined,
          seguimiento: seguimiento.trim() || undefined,
        };
        await onSaveUpdate(payload);
      } else {
        const payload: CrearPersonaPayload = {
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim() || undefined,
          telefono: telefono.trim() || undefined,
          expediente: expediente.trim() || undefined,
          juzgado: juzgado.trim() || undefined,
          seguimiento: seguimiento.trim() || undefined,
        };
        const res = await onSaveCreate(payload);
        if (res && onPersonaCreated) {
          onPersonaCreated(res as Persona);
        }
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
        "Error al procesar la persona en el servidor.";
      setErrorMessage(mainMsg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={personaToEdit ? `Editar Persona #${personaToEdit.id}` : "Registrar Nueva Persona"}
      description={
        personaToEdit
          ? "Actualiza los datos personales, de contacto y judiciales de la persona."
          : "Registra a la persona en el padrón central. Posteriormente podrás asignarle una cuenta en Usuarios."
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
            {personaToEdit ? "Guardar Cambios" : "Registrar Persona"}
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

        {/* Nota informativa de la API */}
        {!personaToEdit && (
          <div className="p-3 rounded-field bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Este registro crea a la persona en el padrón. La cuenta de acceso con contraseña se genera desde el módulo <strong>Usuarios</strong>.
            </span>
          </div>
        )}

        {/* DNI con Búsqueda en Actos Procesales */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Documento de Identidad (DNI) *
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="8 dígitos numéricos"
                maxLength={8}
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                required
                className="w-full text-xs font-mono font-bold bg-white border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBuscarDni()}
              isLoading={isSearchingDni}
              className="h-9 px-3 text-xs shrink-0 font-bold"
              title="Consultar datos en actos procesales"
            >
              <Search className="w-3.5 h-3.5 mr-1 text-olivo" />
              Buscar Datos
            </Button>
          </div>
          {infoMessage && (
            <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-field flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{infoMessage}</span>
            </p>
          )}
        </div>

        {/* Nombre Completo */}
        <div>
          <Input
            label="Nombre Completo *"
            placeholder="Ej. Luis Alberto Pérez Soto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
            error={fieldErrors.nombre?.[0]}
          />
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Correo Electrónico (opcional)"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email?.[0]}
          />

          <Input
            label="Teléfono Celular (opcional)"
            placeholder="Ej. 999888777"
            maxLength={9}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
            error={fieldErrors.telefono?.[0]}
          />
        </div>

        {/* Datos Judiciales / Expediente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de Expediente (opcional)"
            placeholder="Ej. 00001-2026-0-2501-JR-FT-01"
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
            error={fieldErrors.expediente?.[0]}
          />

          <Input
            label="Juzgado de Origen (opcional)"
            placeholder="Ej. Juzgado de Familia"
            value={juzgado}
            onChange={(e) => setJuzgado(e.target.value)}
            error={fieldErrors.juzgado?.[0]}
          />
        </div>

        {/* Estado de Seguimiento */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Estado de Seguimiento (opcional para personal o administradores)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Sin estado", value: "" },
              { label: "🔵 En curso", value: "en_curso" },
              { label: "🟢 Cumple", value: "cumple" },
              { label: "🟡 Alerta", value: "alerta" },
              { label: "🔴 Incumplimiento", value: "incumplimiento" },
              { label: "🟣 Culminado", value: "culminado" },
            ].map((opcion) => (
              <label
                key={opcion.label}
                className={`flex items-center gap-2 p-2.5 rounded-field border text-xs font-bold cursor-pointer transition ${seguimiento === opcion.value
                  ? "border-guinda bg-guinda/5 text-guinda"
                  : "border-linea bg-white text-carbon hover:bg-suave"
                  }`}
              >
                <input
                  type="radio"
                  name="estado_seguimiento"
                  value={opcion.value}
                  checked={seguimiento === opcion.value}
                  onChange={() => setSeguimiento(opcion.value)}
                  className="accent-guinda"
                />
                <span className="truncate">{opcion.label}</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
