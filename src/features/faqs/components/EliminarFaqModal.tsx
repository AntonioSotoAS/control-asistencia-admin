import { Modal, Button } from "@/components/ui";
import { AlertTriangle } from "lucide-react";
import type { Faq } from "../types/faq.types";

interface EliminarFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq?: Faq | null;
  onConfirm: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export function EliminarFaqModal({
  isOpen,
  onClose,
  faq,
  onConfirm,
  isLoading,
}: EliminarFaqModalProps) {
  if (!faq) return null;

  const handleConfirm = async () => {
    await onConfirm(faq.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Pregunta Frecuente"
      description="Esta acción eliminará permanentemente la pregunta y su respuesta del catálogo público y del asistente virtual."
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
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            type="button"
          >
            Eliminar Pregunta
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-tile bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">¿Estás seguro de que deseas eliminar esta pregunta?</p>
            <p className="text-rose-800">
              ID #{faq.id}: <span className="font-semibold italic">"{faq.pregunta}"</span>
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
