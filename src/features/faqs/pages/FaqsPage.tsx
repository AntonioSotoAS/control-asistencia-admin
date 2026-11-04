import { useState, useMemo } from "react";
import { FaqsTable } from "../components/FaqsTable";
import { FaqModal } from "../components/FaqModal";
import { EliminarFaqModal } from "../components/EliminarFaqModal";
import { Button } from "@/components/ui";
import { Plus, Search, RefreshCw, CheckCircle2, HelpCircle } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetFaqsQuery,
  useCrearFaqMutation,
  useActualizarFaqMutation,
  useEliminarFaqMutation,
} from "../services/faqsApi";
import type { Faq, CrearFaqPayload, ActualizarFaqPayload } from "../types/faq.types";

export function FaqsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Consulta a la API: GET /api/faqs
  const {
    data: faqs = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetFaqsQuery();

  const [crearFaq, { isLoading: isCreating }] = useCrearFaqMutation();
  const [actualizarFaq, { isLoading: isUpdating }] = useActualizarFaqMutation();
  const [eliminarFaq, { isLoading: isDeleting }] = useEliminarFaqMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenCreate = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handleDelete = (faq: Faq) => {
    setDeletingFaq(faq);
  };

  const handleSaveCreate = async (payload: CrearFaqPayload) => {
    await crearFaq(payload).unwrap();
    showNotification("Pregunta frecuente creada satisfactoriamente en el servidor (POST /api/faqs).");
  };

  const handleSaveUpdate = async (payload: ActualizarFaqPayload) => {
    await actualizarFaq(payload).unwrap();
    showNotification("Pregunta frecuente actualizada correctamente (PUT /api/faqs/:id).");
  };

  const handleConfirmDelete = async (id: number) => {
    await eliminarFaq(id).unwrap();
    showNotification("Pregunta frecuente eliminada del catálogo (DELETE /api/faqs/:id).");
  };

  // Filtrado reactivo en memoria por pregunta, respuesta o claves
  const filteredFaqs = useMemo(() => {
    if (!debouncedSearch.trim()) return faqs;
    const q = debouncedSearch.toLowerCase().trim();

    return faqs.filter(
      (f) =>
        f.pregunta?.toLowerCase().includes(q) ||
        f.respuesta?.toLowerCase().includes(q) ||
        f.slug?.toLowerCase().includes(q) ||
        f.claves?.some((k) => k.toLowerCase().includes(q))
    );
  }, [faqs, debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Toast Notificación */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabecera y Barra de Filtros */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-guinda text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-carbon tracking-tight">
              Gestión de Preguntas Frecuentes (FAQs)
            </h2>
          </div>
          <p className="text-xs text-olivo">
            Administración del catálogo de respuestas directas y entrenamiento del asistente virtual (/api/faqs).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en preguntas o respuestas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              isLoading={isFetching && !isLoading}
              className="px-3"
              title="Refrescar lista desde el servidor"
            >
              <RefreshCw className="w-4 h-4 text-olivo" />
            </Button>

            <Button
              variant="primary"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold shrink-0"
            >
              Nueva Pregunta
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-tile border border-linea/80 shadow-xs overflow-hidden">
        <FaqsTable
          faqs={filteredFaqs}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRetry={() => refetch()}
        />
      </div>

      {/* Modal para Crear o Editar */}
      <FaqModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faqToEdit={editingFaq}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal de confirmación para Eliminar */}
      <EliminarFaqModal
        isOpen={Boolean(deletingFaq)}
        onClose={() => setDeletingFaq(null)}
        faq={deletingFaq}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default FaqsPage;

