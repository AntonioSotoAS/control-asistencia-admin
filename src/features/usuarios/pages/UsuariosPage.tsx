import { useState } from "react";
import { UsuariosTable } from "../components/UsuariosTable";
import { UsuarioModal } from "../components/UsuarioModal";
import { EliminarUsuarioModal } from "../components/EliminarUsuarioModal";
import { Button } from "@/components/ui";
import { UserPlus, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetUsuariosQuery,
  useCrearUsuarioMutation,
  useActualizarUsuarioMutation,
  useEliminarUsuarioMutation,
} from "../services/usuariosApi";
import type {
  Usuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from "../types/usuario.types";

export function UsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Consulta directa a la API del backend
  const {
    data: usuarios = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetUsuariosQuery(debouncedQuery);

  const [crearUsuario, { isLoading: isCreating }] = useCrearUsuarioMutation();
  const [actualizarUsuario, { isLoading: isUpdating }] = useActualizarUsuarioMutation();
  const [eliminarUsuario, { isLoading: isDeleting }] = useEliminarUsuarioMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: Usuario) => {
    setEditingUsuario(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: Usuario) => {
    setDeletingUsuario(user);
  };

  const handleSaveCreate = async (payload: CrearUsuarioPayload) => {
    await crearUsuario(payload).unwrap();
    showNotification("Cuenta de usuario creada exitosamente en el servidor.");
  };

  const handleSaveUpdate = async (payload: ActualizarUsuarioPayload) => {
    await actualizarUsuario(payload).unwrap();
    showNotification("Cuenta de usuario actualizada correctamente.");
  };

  const handleConfirmDelete = async (id: number) => {
    await eliminarUsuario(id).unwrap();
    showNotification("Cuenta de acceso eliminada satisfactoriamente.");
  };

  return (
    <div className="space-y-6">
      {/* Notificación de éxito */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header y Filtro con búsqueda real por ?q=... */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-carbon tracking-tight">
            Gestión de Cuentas de Acceso
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Administración directa de credenciales y roles sincronizada con la API central.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Input de búsqueda real por identificador, nombre o DNI */}
          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por identificador, nombre o DNI..."
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
              title="Refrescar lista desde el servidor"
            >
              <RefreshCw className="w-4 h-4 text-olivo" />
            </Button>

            <Button
              variant="primary"
              onClick={handleOpenCreate}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="font-bold shrink-0"
            >
              Crear Cuenta
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla con datos reales desde el backend */}
      <UsuariosTable
        usuarios={usuarios}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={() => refetch()}
      />

      {/* Modal para Crear o Editar */}
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        usuarioToEdit={editingUsuario}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal de confirmación para Eliminar */}
      <EliminarUsuarioModal
        isOpen={Boolean(deletingUsuario)}
        onClose={() => setDeletingUsuario(null)}
        usuario={deletingUsuario}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default UsuariosPage;
