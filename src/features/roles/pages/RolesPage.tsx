import { useState, useMemo } from "react";
import { RolesTable } from "../components/RolesTable";
import { RolModal } from "../components/RolModal";
import { EliminarRolModal } from "../components/EliminarRolModal";
import { AsignarPantallasModal } from "@/features/pantallas";
import { Button } from "@/components/ui";
import { Plus, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetRolesQuery,
  useCrearRolMutation,
  useActualizarRolMutation,
  useEliminarRolMutation,
} from "../services/rolesApi";
import type {
  Rol,
  CrearRolPayload,
  ActualizarRolPayload,
} from "../types/rol.types";

export function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [deletingRol, setDeletingRol] = useState<Rol | null>(null);
  const [selectedRolForPermisos, setSelectedRolForPermisos] = useState<Rol | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Consulta directa a la API GET /api/roles
  const {
    data: roles = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetRolesQuery();

  const [crearRol, { isLoading: isCreating }] = useCrearRolMutation();
  const [actualizarRol, { isLoading: isUpdating }] = useActualizarRolMutation();
  const [eliminarRol, { isLoading: isDeleting }] = useEliminarRolMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Filtrado local según la búsqueda por código o nombre
  const filteredRoles = useMemo(() => {
    if (!debouncedSearch.trim()) return roles;
    const term = debouncedSearch.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.codigo.toLowerCase().includes(term) ||
        r.nombre.toLowerCase().includes(term)
    );
  }, [roles, debouncedSearch]);

  const handleOpenCreate = () => {
    setEditingRol(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rol: Rol) => {
    setEditingRol(rol);
    setIsModalOpen(true);
  };

  const handleDelete = (rol: Rol) => {
    setDeletingRol(rol);
  };

  const handleSaveCreate = async (payload: CrearRolPayload) => {
    await crearRol(payload).unwrap();
    showNotification("Nuevo rol creado exitosamente en el sistema.");
  };

  const handleSaveUpdate = async (payload: ActualizarRolPayload) => {
    await actualizarRol(payload).unwrap();
    showNotification("Rol actualizado satisfactoriamente.");
  };

  const handleConfirmDelete = async (id: number) => {
    await eliminarRol(id).unwrap();
    showNotification("Rol eliminado del sistema.");
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

      {/* Cabecera y Barra de Filtro */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-carbon tracking-tight">
            Catálogo de Roles y Perfiles
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Definición de permisos y tipos de usuario disponibles en el sistema.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por código o nombre..."
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
              Crear Rol
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de Roles */}
      <RolesTable
        roles={filteredRoles}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssignPantallas={(rol) => setSelectedRolForPermisos(rol)}
        onRetry={() => refetch()}
      />

      {/* Modal Crear / Editar */}
      <RolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rolToEdit={editingRol}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal Confirmación de Eliminación */}
      <EliminarRolModal
        isOpen={Boolean(deletingRol)}
        onClose={() => setDeletingRol(null)}
        rol={deletingRol}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Modal Asignación de Pantallas y Permisos */}
      {selectedRolForPermisos && (
        <AsignarPantallasModal
          isOpen={Boolean(selectedRolForPermisos)}
          onClose={() => setSelectedRolForPermisos(null)}
          rol={selectedRolForPermisos}
          onSuccess={() => {
            showNotification("Permisos de pantallas actualizados para el rol seleccionado.");
          }}
        />
      )}
    </div>
  );
}

export default RolesPage;
