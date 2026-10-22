import React, { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { QrCode, ScanLine, AlertCircle, Fingerprint, Calendar, Clock } from "lucide-react";
import type {
  RegistrarSesionPayload,
  ApiErrorResponse,
  EstadoAsistencia,
  MetodoAsistencia,
} from "../types/asistencia.types";

interface RegistroAsistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar: (payload: RegistrarSesionPayload) => Promise<void>;
  isLoading?: boolean;
}

export function RegistroAsistenciaModal({
  isOpen,
  onClose,
  onRegistrar,
  isLoading,
}: RegistroAsistenciaModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [personaId, setPersonaId] = useState<number | "">("");
  const [fecha, setFecha] = useState(today);
  const [hora, setHora] = useState(currentTime);
  const [estado, setEstado] = useState<EstadoAsistencia>("PRESENTE");
  const [metodo, setMetodo] = useState<MetodoAsistencia>("QR");
  const [observacion, setObservacion] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const resetForm = () => {
    setPersonaId("");
    setFecha(today);
    setHora(currentTime);
    setEstado("PRESENTE");
    setMetodo("QR");
    setObservacion("");
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!fecha) {
      setErrorMessage("La fecha de asistencia es requerida.");
      return;
    }

    try {
      const payload: RegistrarSesionPayload = {
        fecha,
        hora: hora || undefined,
        persona_id: personaId !== "" ? Number(personaId) : undefined,
        estado,
        metodo,
        observacion: observacion.trim() || undefined,
      };

      await onRegistrar(payload);
      resetForm();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const apiErrors = error.data?.errors || {};
      setFieldErrors(apiErrors);
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "Error al registrar la asistencia en el servidor.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Registrar Marcación de Asistencia"
      description="Registra la asistencia de una persona conectando directamente con el endpoint POST /api/sesiones."
      maxWidth="md"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isLoading}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            type="submit"
          >
            Confirmar Registro
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

        {/* Método de Captura */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Método de Marcación
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "QR", label: "Código QR", icon: QrCode },
              { id: "BIOMETRICO", label: "Biométrico", icon: Fingerprint },
              { id: "DNI_MANUAL", label: "Manual / DNI", icon: ScanLine },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = metodo === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetodo(m.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-tile border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "border-guinda bg-guinda/5 text-guinda shadow-xs"
                      : "border-linea bg-white text-olivo hover:bg-suave"
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha *"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            error={fieldErrors.fecha?.[0]}
            leftIcon={<Calendar className="w-4 h-4 text-olivo" />}
          />

          <Input
            label="Hora de Ingreso"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            error={fieldErrors.hora?.[0]}
            leftIcon={<Clock className="w-4 h-4 text-olivo" />}
          />
        </div>

        {/* Estado y Persona ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-carbon">
              Condición / Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-field border border-linea bg-white px-3.5 py-2.5 text-xs text-carbon font-semibold focus:border-guinda focus:outline-none cursor-pointer"
            >
              <option value="PRESENTE">Presente (Asistencia en orden)</option>
              <option value="TARDANZA">Tardanza (Fuera de tolerancia)</option>
              <option value="JUSTIFICADO">Justificado (Permiso previo)</option>
              <option value="FALTA">Falta (Inasistencia injustificada)</option>
            </select>
          </div>

          <Input
            label="ID de Persona (Opcional)"
            type="number"
            placeholder="Ej. 1"
            value={personaId}
            onChange={(e) =>
              setPersonaId(e.target.value ? Number(e.target.value) : "")
            }
            helperText="Si se omite, registra para la sesión actual."
            error={fieldErrors.persona_id?.[0]}
          />
        </div>

        <Input
          label="Observaciones o Constancia"
          placeholder="Ej. Marcación registrada por operador central"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          error={fieldErrors.observacion?.[0]}
        />
      </form>
    </Modal>
  );
}
