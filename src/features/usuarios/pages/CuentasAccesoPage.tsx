import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { UsuariosTable } from "../components/UsuariosTable";
import { UsuarioModal } from "../components/UsuarioModal";
import { EliminarUsuarioModal } from "../components/EliminarUsuarioModal";
import { PersonasTable } from "@/features/personas/components/PersonasTable";
import { EliminarPersonaModal } from "@/features/personas/components/EliminarPersonaModal";
import { PersonaUsuarioModal } from "@/features/personas/components/PersonaUsuarioModal";
import { Button } from "@/components/ui";
import {
  UserCog,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetUsuariosQuery,
  useCrearUsuarioMutation,
  useActualizarUsuarioMutation,
  useEliminarUsuarioMutation,
} from "../services/usuariosApi";
import {
  useGetPersonasQuery,
  useEliminarPersonaMutation,
} from "@/features/personas/services/personasApi";
import type {
  Usuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from "../types/usuario.types";
import type { Persona } from "@/features/personas/types/persona.types";

interface CuentasAccesoPageProps {
  defaultTab?: "cuentas" | "personas";
}

export function CuentasAccesoPage({ defaultTab = "cuentas" }: CuentasAccesoPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get("tab") as "cuentas" | "personas" | null;

  const [activeTab, setActiveTab] = useState<"cuentas" | "personas">(
    paramTab === "personas" ? "personas" : defaultTab
  );

  useEffect(() => {
    if (paramTab === "personas" || paramTab === "cuentas") {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  const handleTabChange = (tab: "cuentas" | "personas") => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Notificaciones Toast
  const [notification, setNotification] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Consultas RTK Query
  const {
    data: usuarios = [],
    isLoading: isLoadingUsuarios,
    isFetching: isFetchingUsuarios,
    isError: isErrorUsuarios,
    error: errorUsuarios,
    refetch: refetchUsuarios,
  } = useGetUsuariosQuery(activeTab === "cuentas" ? debouncedQuery : undefined);

  const {
    data: personas = [],
    isLoading: isLoadingPersonas,
    isFetching: isFetchingPersonas,
    isError: isErrorPersonas,
    error: errorPersonas,
    refetch: refetchPersonas,
  } = useGetPersonasQuery(activeTab === "personas" ? debouncedQuery : undefined);

  // Mutations Usuarios
  const [crearUsuario, { isLoading: isCreatingUsuario }] = useCrearUsuarioMutation();
  const [actualizarUsuario, { isLoading: isUpdatingUsuario }] = useActualizarUsuarioMutation();
  const [eliminarUsuario, { isLoading: isDeletingUsuario }] = useEliminarUsuarioMutation();

  // Mutations Personas
  const [eliminarPersona, { isLoading: isDeletingPersona }] = useEliminarPersonaMutation();

  // Modales
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] = useState(false);
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);

  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deletingPersona, setDeletingPersona] = useState<Persona | null>(null);

  // Acciones Cuentas / Usuarios
  const handleOpenCreate = () => {
    setEditingPersona(null);
    setIsUnifiedModalOpen(true);
  };

  const handleEditUsuario = (u: Usuario) => {
    setEditingUsuario(u);
    setIsUsuarioModalOpen(true);
  };

  const handleDeleteUsuario = (u: Usuario) => {
    setDeletingUsuario(u);
  };

  const handleSaveUsuarioCreate = async (payload: CrearUsuarioPayload) => {
    await crearUsuario(payload).unwrap();
    showNotification("Cuenta de usuario creada exitosamente.");
    refetchUsuarios();
  };

  const handleSaveUsuarioUpdate = async (payload: ActualizarUsuarioPayload) => {
    await actualizarUsuario(payload).unwrap();
    showNotification("Cuenta de usuario actualizada correctamente.");
    refetchUsuarios();
  };

  const handleConfirmDeleteUsuario = async (id: number) => {
    await eliminarUsuario(id).unwrap();
    showNotification("Cuenta de acceso eliminada satisfactoriamente.");
    refetchUsuarios();
  };

  // Acciones Personas
  const handleEditPersona = (p: Persona) => {
    setEditingPersona(p);
    setIsUnifiedModalOpen(true);
  };

  const handleDeletePersona = (p: Persona) => {
    setDeletingPersona(p);
  };

  const handleConfirmDeletePersona = async (id: number) => {
    await eliminarPersona(id).unwrap();
    showNotification("Persona eliminada del padrón satisfactoriamente.");
    refetchPersonas();
  };

  const handleRefresh = () => {
    if (activeTab === "cuentas") {
      refetchUsuarios();
    } else {
      refetchPersonas();
    }
  };

  const isRefreshing =
    activeTab === "cuentas"
      ? isFetchingUsuarios && !isLoadingUsuarios
      : isFetchingPersonas && !isLoadingPersonas;

  return (
    <div className="space-y-6">
      {/* Toast Notificación */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabecera Principal y Barra de Búsqueda */}
      <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#562599] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <UserCog className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-carbon tracking-tight">
                Cuentas de Acceso
              </h2>
            </div>
            <p className="text-xs text-olivo mt-1">
              Gestión unificada de usuarios, credenciales y padrón civil sincronizado con el backend central.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Input de búsqueda reactivo según la pestaña activa */}
            <div className="relative w-full sm:w-auto sm:min-w-[280px]">
              <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  activeTab === "cuentas"
                    ? "Buscar por identificador, nombre o DNI..."
                    : "Buscar por nombre, DNI o expediente..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                isLoading={isRefreshing}
                className="px-3"
                title="Actualizar datos desde el servidor"
              >
                <RefreshCw className="w-4 h-4 text-olivo" />
              </Button>

              <Button
                variant="primary"
                onClick={handleOpenCreate}
                leftIcon={<UserPlus className="w-4 h-4 text-white" />}
                className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold shrink-0 shadow-xs"
              >
                Registrar Persona y Cuenta
              </Button>
            </div>
          </div>
        </div>

        {/* Pestañas Segmentadas: Cuentas de Acceso vs Padrón de Personas */}
        <div className="flex items-center gap-2 pt-3 border-t border-linea/60">
          <button
            type="button"
            onClick={() => handleTabChange("cuentas")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-field text-xs font-bold transition-all cursor-pointer",
              activeTab === "cuentas"
                ? "bg-[#562599] text-white shadow-xs"
                : "bg-suave/70 text-carbon/70 hover:text-carbon hover:bg-suave border border-linea/60"
            )}
          >
            <UserCog className="w-4 h-4" />
            <span>Cuentas de Usuario</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none",
                activeTab === "cuentas"
                  ? "bg-white/20 text-white"
                  : "bg-white text-olivo border border-linea/50"
              )}
            >
              {usuarios.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("personas")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-field text-xs font-bold transition-all cursor-pointer",
              activeTab === "personas"
                ? "bg-[#562599] text-white shadow-xs"
                : "bg-suave/70 text-carbon/70 hover:text-carbon hover:bg-suave border border-linea/60"
            )}
          >
            <UserCheck className="w-4 h-4" />
            <span>Padrón de Personas</span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none",
                activeTab === "personas"
                  ? "bg-white/20 text-white"
                  : "bg-white text-olivo border border-linea/50"
              )}
            >
              {personas.length}
            </span>
          </button>
        </div>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === "cuentas" ? (
        <UsuariosTable
          usuarios={usuarios}
          isLoading={isLoadingUsuarios}
          isError={isErrorUsuarios}
          error={errorUsuarios}
          onEdit={handleEditUsuario}
          onDelete={handleDeleteUsuario}
          onRetry={() => refetchUsuarios()}
        />
      ) : (
        <PersonasTable
          personas={personas}
          isLoading={isLoadingPersonas}
          isError={isErrorPersonas}
          error={errorPersonas}
          onEdit={handleEditPersona}
          onDelete={handleDeletePersona}
          onRetry={() => refetchPersonas()}
        />
      )}

      {/* Modal Unificado Registrar Persona y Cuenta / Editar Persona */}
      <PersonaUsuarioModal
        isOpen={isUnifiedModalOpen}
        onClose={() => {
          setIsUnifiedModalOpen(false);
          setEditingPersona(null);
        }}
        personaToEdit={editingPersona}
        onSuccess={(msg) => {
          showNotification(msg);
          refetchUsuarios();
          refetchPersonas();
        }}
      />

      {/* Modal para Editar Cuenta de Usuario (credenciales, rol, estado) */}
      <UsuarioModal
        isOpen={isUsuarioModalOpen}
        onClose={() => {
          setIsUsuarioModalOpen(false);
          setEditingUsuario(null);
        }}
        usuarioToEdit={editingUsuario}
        onSaveCreate={handleSaveUsuarioCreate}
        onSaveUpdate={handleSaveUsuarioUpdate}
        isLoading={isCreatingUsuario || isUpdatingUsuario}
      />

      {/* Modal Confirmación Eliminar Cuenta de Usuario */}
      <EliminarUsuarioModal
        isOpen={Boolean(deletingUsuario)}
        onClose={() => setDeletingUsuario(null)}
        usuario={deletingUsuario}
        onConfirm={handleConfirmDeleteUsuario}
        isLoading={isDeletingUsuario}
      />

      {/* Modal Confirmación Eliminar Persona del Padrón */}
      <EliminarPersonaModal
        isOpen={Boolean(deletingPersona)}
        onClose={() => setDeletingPersona(null)}
        persona={deletingPersona}
        onConfirm={handleConfirmDeletePersona}
        isLoading={isDeletingPersona}
      />
    </div>
  );
}

export default CuentasAccesoPage;

