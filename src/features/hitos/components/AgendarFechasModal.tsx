import React, { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { Calendar, Plus, Trash2, AlertCircle, CalendarDays } from "lucide-react";
import type {
  AgendarFechasHitoPayload,
  ApiErrorResponse,
  HitoAvance,
} from "../types/hito.types";

interface AgendarFechasModalProps {
  isOpen: boolean;
  onClose: () => void;
  hito?: HitoAvance | null;
  onAgendar: (payload: AgendarFechasHitoPayload) => Promise<void>;
  isLoading?: boolean;
}

export function AgendarFechasModal({
  isOpen,
  onClose,
  hito,
  onAgendar,
  isLoading,
}: AgendarFechasModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [fechas, setFechas] = useState<string[]>([today]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleAddFecha = () => {
    setFechas((prev) => [...prev, ""]);
  };

  const handleRemoveFecha = (index: number) => {
    if (fechas.length === 1) return;
    setFechas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeFecha = (index: number, val: string) => {
    setFechas((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const validFechas = fechas.filter((f) => f.trim() !== "");
    if (validFechas.length === 0) {
      setErrorMessage("Debes programar al menos una fecha para las sesiones del hito.");
      return;
    }

    try {
      const payload: AgendarFechasHitoPayload = {
        fechas: validFechas,
        hito_id: hito?.id,
      };

      await onAgendar(payload);
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const apiErrors = error.data?.errors || {};
      setFieldErrors(apiErrors);
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "Error al agendar las fechas de sesiones en el servidor.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Fechas de Sesiones del Hito"
      description="Registra el cronograma de fechas obligatorias de asistencia para el cumplimiento del hito (POST /api/hitos/fechas)."
      maxWidth="md"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
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
            Guardar Fechas
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

        {hito && (
          <div className="p-3.5 rounded-field bg-suave/80 border border-linea text-xs space-y-1">
            <p className="font-bold text-carbon">{hito.nombre}</p>
            <p className="text-[11px] text-olivo">
              Fecha Hito Límite: <strong className="text-carbon">{hito.fecha_hito || hito.fecha}</strong>
            </p>
          </div>
        )}

        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-guinda" />
              Fechas de las Sesiones ({fechas.length})
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFecha}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs py-1 h-7"
            >
              Agregar Fecha
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {fechas.map((fechaVal, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-xs font-mono font-bold text-olivo text-center">
                  #{idx + 1}
                </span>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={fechaVal}
                    onChange={(e) => handleChangeFecha(idx, e.target.value)}
                    required
                    leftIcon={<Calendar className="w-4 h-4 text-olivo" />}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFecha(idx)}
                  disabled={fechas.length === 1}
                  className="p-2 rounded-field text-olivo hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Eliminar esta fecha"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
