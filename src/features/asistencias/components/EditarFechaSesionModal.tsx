import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { Calendar, AlertCircle, User, Layers } from "lucide-react";
import type { SesionAsistencia, ApiErrorResponse } from "../types/asistencia.types";

interface EditarFechaSesionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sesion: SesionAsistencia | null;
  onSave: (payload: { id: number; fecha: string }) => Promise<void>;
  isLoading?: boolean;
}

export function EditarFechaSesionModal({
  isOpen,
  onClose,
  sesion,
  onSave,
  isLoading,
}: EditarFechaSesionModalProps) {
  const [fecha, setFecha] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sesion) {
      setErrorMessage(null);
      const f = sesion.fecha?.includes("T") ? sesion.fecha.split("T")[0] : sesion.fecha || "";
      setFecha(f);
    }
  }, [isOpen, sesion]);

  if (!isOpen || !sesion) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fecha) {
      setErrorMessage("Debes ingresar una fecha válida.");
      return;
    }

    try {
      await onSave({
        id: sesion.id,
        fecha,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: ApiErrorResponse; error?: string };
      const msg =
        error.data?.message ||
        error.data?.mensaje ||
        error.error ||
        "Error al actualizar la fecha de la sesión.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modificar Fecha de la Sesión #${sesion.numero || sesion.id}`}
      description="Cambia la fecha programada de la sesión para el beneficiario (PUT /api/sesiones/{id}/fecha)."
      maxWidth="sm"
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
            className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold"
          >
            Guardar Nueva Fecha
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

        {/* Resumen de la Sesión */}
        <div className="p-3 rounded-field bg-suave/80 border border-linea text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-carbon font-extrabold">
            <User className="w-3.5 h-3.5 text-guinda shrink-0" />
            <span className="truncate">{sesion.beneficiarioNombre || `Persona #${sesion.persona_id}`}</span>
            {sesion.beneficiarioDni && (
              <span className="font-mono text-[10px] text-olivo bg-white px-1.5 py-0.5 rounded border border-linea/60">
                {sesion.beneficiarioDni}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-olivo text-[11px]">
            <Layers className="w-3.5 h-3.5 text-olivo shrink-0" />
            <span>{sesion.hitoNombre || `Hito #${sesion.hito_id}`}</span>
            <span>•</span>
            <span className="font-bold text-carbon">Sesión #{sesion.numero || sesion.id}</span>
          </div>
        </div>

        {/* Input de Fecha */}
        <div className="space-y-1.5 text-left">
          <Input
            label="Nueva Fecha de la Sesión *"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4 text-olivo" />}
            helperText="Puedes indicar fechas presentes, futuras o pasadas según la orden judicial."
          />
        </div>
      </form>
    </Modal>
  );
}
