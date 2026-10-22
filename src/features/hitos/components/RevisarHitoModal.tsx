import React, { useState, useEffect } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import { CheckCircle2, XCircle, AlertCircle, Calendar } from "lucide-react";
import type {
  HitoAvance,
  RevisarFechasHitoPayload,
  ApiErrorResponse,
} from "../types/hito.types";

interface RevisarHitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  hito: HitoAvance | null;
  onRevisar: (payload: RevisarFechasHitoPayload) => Promise<void>;
  isLoading?: boolean;
}

export function RevisarHitoModal({
  isOpen,
  onClose,
  hito,
  onRevisar,
  isLoading,
}: RevisarHitoModalProps) {
  const [valido, setValido] = useState<boolean>(true);
  const [observacion, setObservacion] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hito) {
      setValido(hito.valido ?? true);
      setObservacion(hito.observacion_revision || "");
      setErrorMessage(null);
    }
  }, [hito, isOpen]);

  if (!hito) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await onRevisar({
        id: hito.id!,
        valido,
        revision: valido ? "valida" : "observada",
        estado: valido ? "activo" : "observado",
        observacion: observacion.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "Error al registrar la revisión de fechas del hito.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Revisión de Fechas del Hito #${hito.id}`}
      description="Verifica la validez y cumplimiento reglamentario de las fechas programadas (PUT /api/hitos/{id}/revision)."
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
            Guardar Dictamen
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-field bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {/* Resumen del Hito */}
        <div className="p-4 rounded-tile bg-suave/80 border border-linea space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-carbon text-sm">{hito.nombre}</h4>
            <Badge variant={hito.valido ? "success" : "warning"}>
              {hito.valido ? "Fechas Válidas" : "Pendiente / Observado"}
            </Badge>
          </div>
          <p className="text-xs text-olivo">
            Fecha Hito Límite: <strong className="text-carbon">{hito.fecha_hito || hito.fecha}</strong>
          </p>
          {hito.fechas && hito.fechas.length > 0 && (
            <div className="pt-2 border-t border-linea/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-olivo block mb-1.5">
                Fechas Agendadas ({hito.fechas.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {hito.fechas.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-linea text-xs font-semibold text-carbon"
                  >
                    <Calendar className="w-3 h-3 text-guinda" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dictamen de Validez */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Dictamen de Validez
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValido(true)}
              className={`p-3.5 rounded-tile border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${valido
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                : "bg-white border-linea text-olivo hover:bg-suave"
                }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Fechas Válidas</span>
            </button>
            <button
              type="button"
              onClick={() => setValido(false)}
              className={`p-3.5 rounded-tile border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${!valido
                ? "bg-rose-50 border-rose-300 text-rose-800 shadow-xs"
                : "bg-white border-linea text-olivo hover:bg-suave"
                }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Observar Fechas</span>
            </button>
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Observaciones del Revisor / Supervisor
          </label>
          <textarea
            rows={3}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Añade observaciones técnicas, motivos de observación o constancia de revisión..."
            className="w-full rounded-field border border-linea bg-white px-3.5 py-2.5 text-xs text-carbon placeholder:text-carbon/40 focus:border-guinda focus:outline-none transition resize-none font-medium"
          />
        </div>
      </form>
    </Modal>
  );
}
