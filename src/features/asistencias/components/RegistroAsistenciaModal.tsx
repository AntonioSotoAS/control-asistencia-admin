import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "@/components/ui";
import {
  AlertCircle,
  Calendar,
  Clock,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  User,
  Layers,
  FileCheck,
} from "lucide-react";
import type {
  RegistrarSesionPayload,
  SesionAsistencia,
  ApiErrorResponse,
  EstadoAsistencia,
  MetodoAsistencia,
} from "../types/asistencia.types";

interface RegistroAsistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: (Partial<SesionAsistencia> & {
    personaNombre?: string;
    personaDni?: string;
    hitoNombre?: string;
  }) | null;
  onRegistrar: (payload: RegistrarSesionPayload) => Promise<void>;
  isLoading?: boolean;
}

export function RegistroAsistenciaModal({
  isOpen,
  onClose,
  initialData,
  onRegistrar,
  isLoading,
}: RegistroAsistenciaModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [personaId, setPersonaId] = useState<number | "">("");
  const [hitoId, setHitoId] = useState<number | "">("");
  const [numero, setNumero] = useState<number | "">("");
  const [fecha, setFecha] = useState(today);
  const [hora, setHora] = useState(currentTime);
  const [tipo, setTipo] = useState<"presencial" | "virtual">("presencial");
  const [asistio, setAsistio] = useState(true);
  const [estado, setEstado] = useState<EstadoAsistencia>("PRESENTE");
  const [metodo, setMetodo] = useState<MetodoAsistencia>("MANUAL");
  const [observacion, setObservacion] = useState("");
  const [archivoPrueba, setArchivoPrueba] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setFieldErrors({});

      if (initialData) {
        setPersonaId(initialData.persona_id ?? "");
        setHitoId(initialData.hito_id ?? "");
        setNumero(initialData.numero ?? "");
        const f = initialData.fecha?.includes("T")
          ? initialData.fecha.split("T")[0]
          : initialData.fecha || today;
        setFecha(f);
        setHora(initialData.hora && initialData.hora !== "—" ? initialData.hora : currentTime);
        setTipo((initialData.tipo as "presencial" | "virtual") || "presencial");
        setAsistio(initialData.asistio ?? true);
        setEstado(initialData.estado || "PRESENTE");
        setMetodo(initialData.metodo || "MANUAL");
        setObservacion(initialData.notas || initialData.observacion || "");
      } else {
        setPersonaId("");
        setHitoId("");
        setNumero("");
        setFecha(today);
        setHora(currentTime);
        setTipo("presencial");
        setAsistio(true);
        setEstado("PRESENTE");
        setMetodo("MANUAL");
        setObservacion("");
      }
      setArchivoPrueba(null);
    }
  }, [isOpen, initialData, today, currentTime]);

  const resetForm = () => {
    setPersonaId("");
    setHitoId("");
    setNumero("");
    setFecha(today);
    setHora(currentTime);
    setTipo("presencial");
    setAsistio(true);
    setEstado("PRESENTE");
    setMetodo("MANUAL");
    setObservacion("");
    setArchivoPrueba(null);
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("El archivo supera el tamaño máximo permitido de 5 MB.");
      return;
    }

    setArchivoPrueba(file);
    setErrorMessage(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("El archivo supera el tamaño máximo permitido de 5 MB.");
      return;
    }

    setArchivoPrueba(file);
    setErrorMessage(null);
  };

  const handleRemoveFile = () => {
    setArchivoPrueba(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        tipo,
        asistio,
        persona_id: personaId !== "" ? Number(personaId) : undefined,
        hito_id: hitoId !== "" ? Number(hitoId) : undefined,
        numero: numero !== "" ? Number(numero) : undefined,
        estado: asistio ? estado : "FALTA",
        metodo,
        notas: observacion.trim() || undefined,
        observacion: observacion.trim() || undefined,
        comprobante: archivoPrueba,
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
      title="Registrar Marcación y Subir Pruebas"
      description="Registra la asistencia de la sesión y adjunta el comprobante o prueba correspondiente (POST /api/sesiones)."
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
            className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold"
          >
            Guardar y Subir Prueba
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

        {/* Ficha contextual si hay datos preseleccionados */}
        {initialData && (
          <div className="p-3 rounded-field bg-suave/80 border border-linea text-xs space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-carbon">
                <User className="w-4 h-4 text-guinda shrink-0" />
                <span>
                  {initialData.personaNombre ||
                    initialData.beneficiarioNombre ||
                    `Persona #${initialData.persona_id || ""}`}
                </span>
                {(initialData.personaDni || initialData.beneficiarioDni) && (
                  <span className="font-mono text-[10px] text-olivo bg-white px-1.5 py-0.5 rounded border border-linea/60">
                    DNI: {initialData.personaDni || initialData.beneficiarioDni}
                  </span>
                )}
              </div>
              {initialData.numero && (
                <span className="font-mono font-bold text-guinda bg-guinda/10 px-2 py-0.5 rounded text-[11px]">
                  Sesión #{initialData.numero}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-olivo text-[11px]">
              <Layers className="w-3.5 h-3.5 text-olivo shrink-0" />
              <span>
                {initialData.hitoNombre ||
                  (initialData.hito_id ? `Hito #${initialData.hito_id}` : "Hito Activo")}
              </span>
            </div>
          </div>
        )}

        {/* Asistencia y Modalidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Condición de Asistencia */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-carbon uppercase tracking-wider">
              ¿Asistió a la Sesión? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAsistio(true)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-field border text-xs font-bold transition-all cursor-pointer ${
                  asistio
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                    : "bg-white border-linea text-olivo hover:bg-suave"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sí, asistió</span>
              </button>
              <button
                type="button"
                onClick={() => setAsistio(false)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-field border text-xs font-bold transition-all cursor-pointer ${
                  !asistio
                    ? "bg-rose-50 border-rose-500 text-rose-800 shadow-xs"
                    : "bg-white border-linea text-olivo hover:bg-suave"
                }`}
              >
                <X className="w-4 h-4 text-rose-600" />
                <span>Inasistencia</span>
              </button>
            </div>
          </div>

          {/* Modalidad: Presencial vs Virtual */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-carbon uppercase tracking-wider">
              Modalidad de Sesión *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipo("presencial")}
                className={`p-2.5 rounded-field border text-xs font-bold transition-all cursor-pointer text-center ${
                  tipo === "presencial"
                    ? "bg-[#562599] border-[#562599] text-white shadow-xs"
                    : "bg-white border-linea text-olivo hover:bg-suave"
                }`}
              >
                Presencial
              </button>
              <button
                type="button"
                onClick={() => setTipo("virtual")}
                className={`p-2.5 rounded-field border text-xs font-bold transition-all cursor-pointer text-center ${
                  tipo === "virtual"
                    ? "bg-[#562599] border-[#562599] text-white shadow-xs"
                    : "bg-white border-linea text-olivo hover:bg-suave"
                }`}
              >
                Virtual
              </button>
            </div>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha de la Sesión *"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            error={fieldErrors.fecha?.[0]}
            leftIcon={<Calendar className="w-4 h-4 text-olivo" />}
          />

          <Input
            label="Hora de la Sesión"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            error={fieldErrors.hora?.[0]}
            leftIcon={<Clock className="w-4 h-4 text-olivo" />}
          />
        </div>

        {/* Subida de Pruebas / Comprobante */}
        <div className="space-y-2 text-left">
          <label className="block text-xs font-bold text-carbon uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-guinda" />
              Subir Comprobante / Prueba (JPG, PNG, PDF hasta 5MB)
            </span>
            <span className="text-[11px] font-normal text-olivo">Opcional</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />

          {!archivoPrueba ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-field border-2 border-dashed text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? "border-guinda bg-guinda/5"
                  : "border-linea bg-suave/40 hover:bg-suave hover:border-linea/80"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white border border-linea/60 flex items-center justify-center shadow-2xs text-guinda">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-carbon">
                  Haz clic para seleccionar o arrastra la prueba aquí
                </p>
                <p className="text-[11px] text-olivo">
                  Formatos soportados: PDF, JPG, PNG (máx. 5 MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-field bg-emerald-50/70 border border-emerald-300 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  {archivoPrueba.name.endsWith(".pdf") ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <p className="font-bold text-carbon truncate">{archivoPrueba.name}</p>
                  <p className="text-[10px] text-olivo">
                    {(archivoPrueba.size / 1024).toFixed(1)} KB • Listo para subir
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="w-7 h-7 rounded-full bg-white border border-linea hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-olivo transition cursor-pointer shrink-0"
                title="Quitar archivo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Si ya existía un comprobante en el servidor */}
          {initialData?.comprobante && !archivoPrueba && (
            <div className="text-[11px] text-olivo flex items-center gap-1.5 pt-1">
              <span>Archivo actual:</span>
              {initialData.comprobante_url ? (
                <a
                  href={initialData.comprobante_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-guinda hover:underline inline-flex items-center gap-1"
                >
                  📎 {initialData.comprobante} ↗
                </a>
              ) : (
                <span className="font-mono text-carbon font-semibold">
                  📎 {initialData.comprobante}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Método y Observación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-carbon uppercase tracking-wider">
              Método de Registro
            </label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className="w-full rounded-field border border-linea bg-white px-3 py-2 text-xs text-carbon font-semibold focus:border-guinda focus:outline-none cursor-pointer"
            >
              <option value="MANUAL">Manual / Panel Web</option>
              <option value="QR">Código QR</option>
              <option value="BIOMETRICO">Biométrico</option>
              <option value="DNI_MANUAL">DNI en Ventanilla</option>
            </select>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-carbon uppercase tracking-wider">
              Estado Administrativo
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full rounded-field border border-linea bg-white px-3 py-2 text-xs text-carbon font-semibold focus:border-guinda focus:outline-none cursor-pointer"
            >
              <option value="PRESENTE">Presente (Asistencia en orden)</option>
              <option value="TARDANZA">Tardanza</option>
              <option value="JUSTIFICADO">Justificado (Permiso judicial)</option>
              <option value="FALTA">Falta (Inasistencia)</option>
            </select>
          </div>
        </div>

        <Input
          label="Observaciones o Notas de la Sesión"
          placeholder="Ej. Asistió con constancia del centro de salud / sesión psicológica..."
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          error={fieldErrors.notas?.[0] || fieldErrors.observacion?.[0]}
        />
      </form>
    </Modal>
  );
}
export default RegistroAsistenciaModal;
