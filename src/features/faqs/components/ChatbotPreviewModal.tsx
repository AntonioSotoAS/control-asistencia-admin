import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import { Bot, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { Faq } from "../types/faq.types";

interface ChatbotPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  faqs: Faq[];
}

export function ChatbotPreviewModal({
  isOpen,
  onClose,
  faqs,
}: ChatbotPreviewModalProps) {
  const [expandedSlug, setExpandedSlug] = useState<string | number | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string | number) => {
    setExpandedSlug(expandedSlug === id ? null : id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vista Previa de la App de Soporte"
      description="Simulación de cómo los beneficiarios y usuarios visualizan las preguntas frecuentes en el Asistente Virtual móvil."
      maxWidth="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Simulación
          </Button>
        </div>
      }
    >
      <div className="flex justify-center p-2">
        {/* Marco de Teléfono Móvil */}
        <div className="w-full max-w-sm rounded-3xl border-4 border-carbon bg-slate-50 shadow-xl overflow-hidden flex flex-col h-[520px]">
          {/* Barra superior de estado del teléfono */}
          <div className="bg-carbon px-6 py-2 flex items-center justify-between text-white text-[10px] font-mono">
            <span>09:41</span>
            <div className="w-16 h-3 bg-carbon/90 rounded-full border border-white/20"></div>
            <span>SIGMA 5G</span>
          </div>

          {/* Encabezado del Asistente */}
          <div className="bg-[#562599] text-white p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-inner">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>Asistente Virtual</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-[11px] text-white/80">
                Soporte y Preguntas Frecuentes
              </p>
            </div>
          </div>

          {/* Cuerpo con preguntas del catálogo */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            <div className="bg-white p-3 rounded-2xl border border-border-soft shadow-2xs text-xs text-ink-primary flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#562599] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink-primary">
                  ¡Hola! ¿En qué puedo orientarte hoy?
                </p>
                <p className="text-[11px] text-ink-secondary mt-0.5">
                  Selecciona una de las consultas frecuentes configuradas por el juzgado:
                </p>
              </div>
            </div>

            {faqs.length === 0 ? (
              <div className="p-6 text-center text-ink-secondary text-xs">
                No hay preguntas configuradas en el catálogo.
              </div>
            ) : (
              faqs.map((faq) => {
                const isExpanded = expandedSlug === (faq.slug || faq.id);
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-xl border border-border-soft overflow-hidden transition-all shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(faq.slug || faq.id)}
                      className="w-full text-left p-3 text-xs font-bold text-ink-primary flex items-center justify-between gap-2 hover:bg-surface-muted/50 transition"
                    >
                      <span className="leading-snug">{faq.pregunta}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#562599] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-ink-tertiary shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 text-xs text-ink-secondary bg-surface-muted/30 border-t border-border-soft space-y-2">
                        <p className="leading-relaxed whitespace-pre-line text-[11px]">
                          {faq.respuesta}
                        </p>
                        {faq.claves && faq.claves.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {faq.claves.map((k, i) => (
                              <span
                                key={i}
                                className="text-[9px] bg-purple-50 text-[#562599] font-semibold px-1.5 py-0.5 rounded border border-purple-200"
                              >
                                #{k}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pie del teléfono */}
          <div className="p-2.5 bg-white border-t border-border-soft text-center text-[10px] text-ink-tertiary">
            Vista previa generada con el catálogo oficial de la API
          </div>
        </div>
      </div>
    </Modal>
  );
}
