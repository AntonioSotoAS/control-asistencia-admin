import React, { useState, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import {
  Calendar,
  FileText,
  UploadCloud,
  X,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import type {
  RegistrarJustificacionPayload,
  ApiErrorResponse,
} from "../types/justificacion.types";

interface JustificacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: RegistrarJustificacionPayload) => Promise<void>;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function JustificacionModal({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: JustificacionModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState(today);
  const [motivo, setMotivo] = useState("");
  const [sesionId, setSesionId] = useState<number | "">("");
  const [archivo, setArchivo] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFecha(today);
    setMotivo("");
    setSesionId("");
    setArchivo(null);
    setErrorMessage(null);
    setFieldErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("El archivo supera el tamaño límite permitido de 5 MB.");
      setArchivo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!validTypes.includes(file.type)) {
      setErrorMessage("Formato no admitido. Debe ser un archivo PDF, JPG o PNG.");
      setArchivo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrorMessage(null);
    setArchivo(file);
  };

  const handleRemoveFile = () => {
    setArchivo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!fecha) {
      setErrorMessage("La fecha de inasistencia es obligatoria.");
      return;
    }

    if (!motivo.trim()) {
      setErrorMessage("El motivo de la justificación es obligatorio.");
      return;
    }

    try {
      const payload: RegistrarJustificacionPayload = {
        fecha,
        motivo: motivo.trim(),
        sesion_id: sesionId !== "" ? Number(sesionId) : null,
        archivo,
      };

      await onSave(payload);
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
        "Error al registrar la justificación en el servidor.";
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
      title="Registrar Justificación de Inasistencia"
      description="Registra la causa de ausencia y adjunta el sustento probatorio (médico, judicial o laboral)."
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
            Registrar Justificación
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

        {/* Fecha y Sesión */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha de la Inasistencia *"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            error={fieldErrors.fecha?.[0]}
            leftIcon={<Calendar className="w-4 h-4 text-olivo" />}
          />

          <Input
            label="ID de la Sesión (Opcional)"
            type="number"
            placeholder="Ej. 10"
            value={sesionId}
            onChange={(e) =>
              setSesionId(e.target.value ? Number(e.target.value) : "")
            }
            error={fieldErrors.sesion_id?.[0]}
            helperText="Número de sesión programada en el sistema."
          />
        </div>

        {/* Motivo */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Motivo de la Inasistencia *
          </label>
          <textarea
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            placeholder="Describe detalladamente el motivo de la inasistencia (cita médica, citación judicial, urgencia familiar, etc.)..."
            className="w-full rounded-field border border-linea bg-white px-3.5 py-2.5 text-xs text-carbon placeholder:text-carbon/40 focus:border-guinda focus:outline-none transition resize-none font-medium"
          />
          {fieldErrors.motivo?.[0] && (
            <p className="text-[11px] text-rose-600 font-semibold">
              {fieldErrors.motivo[0]}
            </p>
          )}
        </div>

        {/* Archivo sustento */}
        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Documento de Sustento (Opcional)
          </label>
          <p className="text-[11px] text-olivo">
            Formatos admitidos: <strong>PDF, JPG, PNG</strong> (tamaño máximo: 5 MB).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            id="archivo-sustento-input"
          />

          {archivo ? (
            <div className="flex items-center justify-between p-3.5 rounded-field bg-emerald-50/70 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-carbon truncate">{archivo.name}</p>
                  <p className="text-[11px] text-olivo">
                    {(archivo.size / (1024 * 1024)).toFixed(2)} MB • {archivo.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 rounded-md text-olivo hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Quitar archivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="archivo-sustento-input"
              className="flex flex-col items-center justify-center p-5 rounded-tile border-2 border-dashed border-linea/80 hover:border-guinda/60 hover:bg-suave/40 transition cursor-pointer group text-center"
            >
              <UploadCloud className="w-7 h-7 text-olivo group-hover:text-guinda transition mb-1.5" />
              <span className="text-xs font-bold text-carbon group-hover:text-guinda">
                Haz clic para adjuntar el certificado o constancia
              </span>
              <span className="text-[11px] text-olivo/70 mt-0.5">
                PDF o fotografía legible hasta 5 MB
              </span>
            </label>
          )}

          {fieldErrors.archivo?.[0] && (
            <p className="text-[11px] text-rose-600 font-semibold">
              {fieldErrors.archivo[0]}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
