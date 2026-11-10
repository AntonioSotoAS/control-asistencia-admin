import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { HelpCircle, AlertCircle, Hash, Tag, FileText, Link2 } from "lucide-react";
import type { Faq, CrearFaqPayload, ActualizarFaqPayload, ApiErrorResponse } from "../types/faq.types";

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqToEdit?: Faq | null;
  onSaveCreate: (data: CrearFaqPayload) => Promise<void>;
  onSaveUpdate: (data: ActualizarFaqPayload) => Promise<void>;
  isLoading?: boolean;
}

export function FaqModal({
  isOpen,
  onClose,
  faqToEdit,
  onSaveCreate,
  onSaveUpdate,
  isLoading,
}: FaqModalProps) {
  const isEditing = Boolean(faqToEdit);

  const [pregunta, setPregunta] = useState("");
  const [slug, setSlug] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [clavesText, setClavesText] = useState("");
  const [orden, setOrden] = useState<number | string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (faqToEdit) {
      setPregunta(faqToEdit.pregunta || "");
      setSlug(faqToEdit.slug || "");
      setRespuesta(faqToEdit.respuesta || "");
      setClavesText(faqToEdit.claves ? faqToEdit.claves.join(", ") : "");
      setOrden(faqToEdit.orden !== undefined ? faqToEdit.orden : "");
    } else {
      setPregunta("");
      setSlug("");
      setRespuesta("");
      setClavesText("");
      setOrden("");
    }
    setErrorMessage(null);
    setFieldErrors({});
  }, [faqToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (pregunta.trim().length < 8) {
      setErrorMessage("La pregunta debe tener al menos 8 caracteres.");
      return;
    }

    if (respuesta.trim().length < 20) {
      setErrorMessage("La respuesta debe tener al menos 20 caracteres para explicar el tema con claridad.");
      return;
    }

    const claves = clavesText
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (claves.length === 0) {
      setErrorMessage("Debes ingresar al menos una palabra clave para que el asistente virtual pueda identificar la consulta.");
      return;
    }

    const cleanSlug = slug.trim().toLowerCase();
    if (cleanSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setErrorMessage("El slug solo puede contener letras minúsculas, números y guiones (ejemplo: registrar-asistencia).");
      return;
    }

    const ordenNum = orden !== "" ? Number(orden) : undefined;

    try {
      if (isEditing && faqToEdit) {
        await onSaveUpdate({
          id: faqToEdit.id,
          slug: cleanSlug || undefined,
          pregunta: pregunta.trim(),
          respuesta: respuesta.trim(),
          claves,
          orden: ordenNum,
        });
      } else {
        await onSaveCreate({
          slug: cleanSlug || undefined,
          pregunta: pregunta.trim(),
          respuesta: respuesta.trim(),
          claves,
          orden: ordenNum,
        });
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
        "Error al guardar la pregunta frecuente en el servidor.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Pregunta #${faqToEdit?.id}` : "Nueva Pregunta Frecuente"}
      description="Configura la pregunta, respuesta detallada y palabras clave para la atención del usuario en el Asistente Virtual."
      maxWidth="lg"
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
            {isEditing ? "Guardar Cambios" : "Crear Pregunta"}
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

        {/* Pregunta */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-guinda" />
            Pregunta Frecuente *
          </label>
          <Input
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            placeholder="Ej: ¿Cómo registro mi asistencia a la terapia?"
            required
          />
        </div>

        {/* Slug / Identificador */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-olivo" />
              Identificador / Slug en App (Opcional)
            </span>
            <span className="text-[10px] text-olivo font-normal lowercase">
              ej: registrar-asistencia
            </span>
          </label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Si se deja vacío, se genera automáticamente de la pregunta"
          />
          <p className="text-[11px] text-olivo">
            Identificador único que utiliza la app en minúsculas y con guiones.
          </p>
        </div>

        {/* Respuesta */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-guinda" />
              Respuesta Detallada *
            </span>
            <span className="text-[10px] text-olivo font-normal">
              mínimo 20 caracteres ({respuesta.length}/20)
            </span>
          </label>
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={4}
            className="w-full text-xs font-medium bg-suave/50 border border-linea rounded-field p-3 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
            placeholder="Escribe la respuesta clara que resolverá la duda del beneficiario o usuario (mínimo 20 caracteres)..."
            required
          />
        </div>

        {/* Palabras Clave y Orden */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-olivo" />
              Palabras Clave * (separadas por coma)
            </label>
            <Input
              value={clavesText}
              onChange={(e) => setClavesText(e.target.value)}
              placeholder="Ej: registrar asistencia, constancia, comprobante"
              required
            />
            <p className="text-[10px] text-olivo">
              Palabras clave que activan esta respuesta en el chatbot de soporte.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-carbon flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-olivo" />
              Orden en Catálogo
            </label>
            <Input
              type="number"
              min="0"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
