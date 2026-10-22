import { useState } from "react";
import { PersonasTable } from "../components/PersonasTable";
import { PersonaModal } from "../components/PersonaModal";
import { EliminarPersonaModal } from "../components/EliminarPersonaModal";
import { Button } from "@/components/ui";
import { UserPlus, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetPersonasQuery,
  useCrearPersonaMutation,
  useActualizarPersonaMutation,
  useEliminarPersonaMutation,
} from "../services/personasApi";
import type {
  Persona,
  CrearPersonaPayload,
  ActualizarPersonaPayload,
} from "../types/persona.types";

export function PersonasPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deletingPersona, setDeletingPersona] = useState<Persona | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Consulta directa al backend por ?q=...
  const {
    data: personas = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPersonasQuery(debouncedQuery);

  const [crearPersona, { isLoading: isCreating }] = useCrearPersonaMutation();
  const [actualizarPersona, { isLoading: isUpdating }] = useActualizarPersonaMutation();
  const [eliminarPersona, { isLoading: isDeleting }] = useEliminarPersonaMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenCreate = () => {
    setEditingPersona(null);
    setIsModalOpen(true);
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setIsModalOpen(true);
  };

  const handleDelete = (persona: Persona) => {
    setDeletingPersona(persona);
  };

  const handleSaveCreate = async (payload: CrearPersonaPayload) => {
    await crearPersona(payload).unwrap();
    showNotification("Persona registrada exitosamente en el padrón.");
  };

  const handleSaveUpdate = async (payload: ActualizarPersonaPayload) => {
    await actualizarPersona(payload).unwrap();
    showNotification("Datos de la persona actualizados correctamente.");
  };

  const handleConfirmDelete = async (id: number) => {
    await eliminarPersona(id).unwrap();
    showNotification("Persona eliminada del padrón satisfactoriamente.");
  };

  return (
    <div className="space-y-6">
      {/* Alerta de notificación */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabecera y Barra de Búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-carbon tracking-tight">
            Padrón General de Personas
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Registro de ciudadanos y beneficiarios vinculado a expedientes y juzgados.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o expediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              title="Actualizar lista"
            >
              <RefreshCw className="w-4 h-4 text-olivo" />
            </Button>

            <Button
              variant="primary"
              onClick={handleOpenCreate}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="font-bold shrink-0"
            >
              Registrar Persona
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <PersonasTable
        personas={personas}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => refetch()}
      />

      {/* Modal Crear / Editar */}
      <PersonaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        personaToEdit={editingPersona}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal Confirmación de Eliminación */}
      <EliminarPersonaModal
        isOpen={Boolean(deletingPersona)}
        onClose={() => setDeletingPersona(null)}
        persona={deletingPersona}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default PersonasPage;
