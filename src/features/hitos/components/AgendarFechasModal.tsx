import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import {
  Calendar,
  Plus,
  Trash2,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Lock,
} from "lucide-react";
import type {
  AgendarFechasHitoPayload,
  ApiErrorResponse,
  HitoAvance,
} from "../types/hito.types";

interface AgendarFechasModalProps {
  isOpen: boolean;
  onClose: () => void;
  hito?: HitoAvance | null;
  selectedBeneficiaries?: number[];
  onAgendar: (payload: AgendarFechasHitoPayload) => Promise<void>;
  onEditarFechas?: (payload: { id: number; fechas: string[] }) => Promise<void>;
  isLoading?: boolean;
}

export function AgendarFechasModal({
  isOpen,
  onClose,
  hito,
  selectedBeneficiaries = [],
  onAgendar,
  onEditarFechas,
  isLoading,
}: AgendarFechasModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [fechas, setFechas] = useState<string[]>([today]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEditing = Boolean(hito?.id && (hito?.fechas?.length || hito?.sesiones?.length));

  // Identificar fechas que ya tienen asistencia registrada para protegerlas
  const fechasConAsistencia = new Set(
    hito?.sesiones
      ?.filter((s) => Boolean(s.asistio || s.estado === "asistio" || s.estado === "presente"))
      .map((s) => (s.fecha?.includes("T") ? s.fecha.split("T")[0] : s.fecha))
      .filter(Boolean) as string[]
  );

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setFieldErrors({});

      const loadedDates: string[] = [];
      if (hito?.fechas && hito.fechas.length > 0) {
        loadedDates.push(...hito.fechas);
      } else if (hito?.sesiones && hito.sesiones.length > 0) {
        loadedDates.push(...hito.sesiones.map((s) => s.fecha).filter(Boolean));
      }

      if (loadedDates.length > 0) {
        setFechas(loadedDates.map((d) => (d.includes("T") ? d.split("T")[0] : d)));
      } else {
        const now = new Date().toISOString().split("T")[0];
        setFechas([now]);
      }
    }
  }, [isOpen, hito]);

  const handleAddFecha = () => {
    setFechas((prev) => [...prev, ""]);
  };

  const handleRemoveFecha = (index: number) => {
    const targetDate = fechas[index];
    if (fechasConAsistencia.has(targetDate)) {
      setErrorMessage("No se puede eliminar una fecha que ya cuenta con asistencia registrada.");
      return;
    }
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
      if (hito?.id && onEditarFechas) {
        await onEditarFechas({
          id: hito.id,
          fechas: validFechas,
        });
      } else {
        const payload: AgendarFechasHitoPayload = {
          fechas: validFechas,
          selectedBeneficiaries:
            selectedBeneficiaries.length > 0
              ? selectedBeneficiaries
              : hito?.persona_id
              ? [hito.persona_id]
              : [],
          beneficiarios:
            selectedBeneficiaries.length > 0
              ? selectedBeneficiaries
              : hito?.persona_id
              ? [hito.persona_id]
              : [],
          persona_id:
            selectedBeneficiaries.length === 1
              ? selectedBeneficiaries[0]
              : hito?.persona_id || hito?.persona?.id,
          ...(hito?.id ? { hito_id: hito.id } : {}),
        };

        await onAgendar(payload);
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const apiErrors = error.data?.errors || {};
      setFieldErrors(apiErrors);
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "Error al procesar las fechas de sesiones en el servidor.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? `Editar Fechas de Sesiones - Hito #${hito?.id}`
          : "Agendar Fechas de Sesiones del Hito"
      }
      description={
        isEditing
          ? "Modifica el cronograma de fechas o agrega nuevas sesiones al hito (PUT /api/hitos/{id}/fechas)."
          : selectedBeneficiaries.length > 1
          ? `Agendando cronograma simultáneo para ${selectedBeneficiaries.length} beneficiarios seleccionados (POST /api/hitos/fechas).`
          : "Registra el cronograma de fechas obligatorias de asistencia para el cumplimiento del hito (POST /api/hitos/fechas)."
      }
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
            {isEditing ? "Guardar Cambios" : "Guardar Fechas"}
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
            {hito.persona?.expediente && (
              <p className="text-[11px] text-olivo font-mono">
                Expediente: <strong className="text-carbon">{hito.persona.expediente}</strong>
              </p>
            )}
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

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {fechas.map((fechaVal, idx) => {
              const tieneAsistencia = fechasConAsistencia.has(fechaVal);

              return (
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

                  {tieneAsistencia && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded shrink-0"
                      title="Esta fecha ya cuenta con asistencia registrada y no debe eliminarse"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Asistió
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveFecha(idx)}
                    disabled={fechas.length === 1 || tieneAsistencia}
                    className="p-2 rounded-field text-olivo hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition shrink-0"
                    title={
                      tieneAsistencia
                        ? "Esta sesión ya cuenta con asistencia registrada y debe conservarse"
                        : "Eliminar esta fecha"
                    }
                  >
                    {tieneAsistencia ? (
                      <Lock className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
