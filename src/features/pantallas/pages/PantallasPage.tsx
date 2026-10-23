import { useState, useMemo } from "react";
import { PantallasTable } from "../components/PantallasTable";
import { PantallaModal } from "../components/PantallaModal";
import { AsignarPantallasModal } from "../components/AsignarPantallasModal";
import { ConfiguradorPermisosRol } from "../components/ConfiguradorPermisosRol";
import { Button } from "@/components/ui";
import {
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  Layers,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetPantallasQuery,
  useCrearPantallaMutation,
  useActualizarPantallaMutation,
  useEliminarPantallaMutation,
} from "../services/pantallasApi";
import { useGetRolesQuery } from "@/features/roles/services/rolesApi";
import type {
  Pantalla,
  CrearPantallaPayload,
  ActualizarPantallaPayload,
} from "../types/pantalla.types";
import type { Rol } from "@/features/roles/types/rol.types";

export function PantallasPage() {
  const [activeTab, setActiveTab] = useState<"permisos" | "catalogo">("permisos");
  const [searchTerm, setSearchTerm] = useState("");
  const [grupoFilter, setGrupoFilter] = useState<string>("TODOS");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPantalla, setEditingPantalla] = useState<Pantalla | null>(null);
  const [selectedRolForPermisos, setSelectedRolForPermisos] = useState<Rol | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Consulta al catálogo de pantallas GET /api/pantallas
  const {
    data: pantallas = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPantallasQuery();

  // Consulta a los roles para el configurador de permisos
  const { data: roles = [], isLoading: isLoadingRoles } = useGetRolesQuery();

  const [crearPantalla, { isLoading: isCreating }] = useCrearPantallaMutation();
  const [actualizarPantalla, { isLoading: isUpdating }] = useActualizarPantallaMutation();
  const [eliminarPantalla] = useEliminarPantallaMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const filteredPantallas = useMemo(() => {
    return pantallas.filter((p) => {
      if (grupoFilter !== "TODOS" && p.grupo !== grupoFilter) {
        return false;
      }
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.toLowerCase().trim();
        return (
          p.codigo.toLowerCase().includes(term) ||
          p.nombre.toLowerCase().includes(term) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
          p.ruta.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [pantallas, grupoFilter, debouncedSearch]);

  const handleOpenCreate = () => {
    setEditingPantalla(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pantalla: Pantalla) => {
    setEditingPantalla(pantalla);
    setIsModalOpen(true);
  };

  const handleDelete = async (pantalla: Pantalla) => {
    if (confirm(`¿Estás seguro de eliminar la pantalla "${pantalla.nombre}" (${pantalla.codigo})?`)) {
      try {
        await eliminarPantalla(pantalla.id).unwrap();
        showNotification("Pantalla eliminada del sistema.");
      } catch (err: unknown) {
        const error = err as { data?: { message?: string; mensaje?: string } };
        alert(error?.data?.message || error?.data?.mensaje || "No se pudo eliminar la pantalla.");
      }
    }
  };

  const handleSaveCreate = async (payload: CrearPantallaPayload) => {
    await crearPantalla(payload).unwrap();
    showNotification("Pantalla registrada exitosamente en el catálogo.");
  };

  const handleSaveUpdate = async (payload: ActualizarPantallaPayload) => {
    await actualizarPantalla(payload).unwrap();
    showNotification("Pantalla actualizada satisfactoriamente.");
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

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-carbon tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-guinda" />
            Control de Pantallas y Permisos por Rol
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Configura visualmente qué módulos del menú puede ver cada rol o administra el catálogo de vistas.
          </p>
        </div>

        {/* Pestañas de Vista Principal */}
        <div className="flex items-center gap-1.5 bg-suave/80 p-1.5 rounded-field border border-linea/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("permisos")}
            className={`px-3.5 py-1.5 rounded-field text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "permisos"
                ? "bg-guinda text-white shadow-2xs"
                : "text-olivo hover:text-carbon"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Permisos por Rol</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("catalogo")}
            className={`px-3.5 py-1.5 rounded-field text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "catalogo"
                ? "bg-guinda text-white shadow-2xs"
                : "text-olivo hover:text-carbon"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Catálogo de Pantallas</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: CONFIGURACIÓN DE PERMISOS POR ROL CON CHECKS */}
      {activeTab === "permisos" && (
        <ConfiguradorPermisosRol roles={roles} isLoadingRoles={isLoadingRoles} />
      )}

      {/* VISTA 2: CATÁLOGO CRUD DE PANTALLAS */}
      {activeTab === "catalogo" && (
        <div className="space-y-5">
          {/* Barra de Filtro y Creación */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-tile border border-linea/80 shadow-xs">
            <div className="relative min-w-[260px] flex-1">
              <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar pantalla por código, nombre o ruta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field pl-10 pr-4 py-2 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                isLoading={isFetching && !isLoading}
                className="px-3"
                title="Refrescar pantallas"
              >
                <RefreshCw className="w-4 h-4 text-olivo" />
              </Button>

              <Button
                variant="primary"
                onClick={handleOpenCreate}
                leftIcon={<Plus className="w-4 h-4" />}
                className="font-bold shrink-0"
              >
                Nueva Pantalla
              </Button>
            </div>
          </div>

          {/* Pestañas de filtrado por grupo */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "TODOS", label: "Todas las Pantallas" },
              { id: "proceso", label: "Proceso" },
              { id: "administracion", label: "Administración" },
              { id: "sistema", label: "Sistema" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGrupoFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  grupoFilter === tab.id
                    ? "bg-guinda text-white shadow-xs"
                    : "bg-white text-olivo hover:text-carbon border border-linea/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabla de Pantallas */}
          <PantallasTable
            pantallas={filteredPantallas}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* Modal Crear / Editar Pantalla */}
      <PantallaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
        pantallaToEdit={editingPantalla}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal Asignar Pantallas al Rol (para uso rápido auxiliar) */}
      <AsignarPantallasModal
        isOpen={Boolean(selectedRolForPermisos)}
        onClose={() => setSelectedRolForPermisos(null)}
        rol={selectedRolForPermisos}
        onSuccess={() => {
          showNotification("Permisos de pantallas actualizados para el rol seleccionado.");
        }}
      />
    </div>
  );
}
