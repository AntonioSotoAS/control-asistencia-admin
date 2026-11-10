import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { UsuariosTable } from "../components/UsuariosTable";
import { UsuarioModal } from "../components/UsuarioModal";
import { EliminarUsuarioModal } from "../components/EliminarUsuarioModal";
import { PersonasTable } from "@/features/personas/components/PersonasTable";
import { PersonaModal } from "@/features/personas/components/PersonaModal";
import { EliminarPersonaModal } from "@/features/personas/components/EliminarPersonaModal";
import { Modal, Button } from "@/components/ui";
import {
  UserCog,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
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
  useCrearPersonaMutation,
  useActualizarPersonaMutation,
  useEliminarPersonaMutation,
} from "@/features/personas/services/personasApi";
import type {
  Usuario,
  CrearUsuarioPayload,
  ActualizarUsuarioPayload,
} from "../types/usuario.types";
import type {
  Persona,
  CrearPersonaPayload,
  ActualizarPersonaPayload,
} from "@/features/personas/types/persona.types";

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

  // Mutations Personas
  const [crearPersona, { isLoading: isCreatingPersona }] = useCrearPersonaMutation();
  const [actualizarPersona, { isLoading: isUpdatingPersona }] = useActualizarPersonaMutation();
  const [eliminarPersona, { isLoading: isDeletingPersona }] = useEliminarPersonaMutation();

  // Mutations Usuarios
  const [crearUsuario, { isLoading: isCreatingUsuario }] = useCrearUsuarioMutation();
  const [actualizarUsuario, { isLoading: isUpdatingUsuario }] = useActualizarUsuarioMutation();
  const [eliminarUsuario, { isLoading: isDeletingUsuario }] = useEliminarUsuarioMutation();

  // Estado Modales - Paso 1: Persona
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [deletingPersona, setDeletingPersona] = useState<Persona | null>(null);

  // Estado Modales - Paso 2: Usuario
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [selectedPersonaForUser, setSelectedPersonaForUser] = useState<Persona | null>(null);
  const [deletingUsuario, setDeletingUsuario] = useState<Usuario | null>(null);

  // Modal Guiado Paso 1 -> Paso 2 (Continuar a creación de cuenta)
  const [stepPromptPersona, setStepPromptPersona] = useState<Persona | null>(null);

  // -------------------------------------------------------------
  // Flujo Paso 1: Registrar Persona
  // -------------------------------------------------------------
  const handleOpenRegistrarPersona = () => {
    setEditingPersona(null);
    setIsPersonaModalOpen(true);
  };

  const handleEditPersona = (p: Persona) => {
    setEditingPersona(p);
    setIsPersonaModalOpen(true);
  };

  const handleDeletePersona = (p: Persona) => {
    setDeletingPersona(p);
  };

  const handleSavePersonaCreate = async (payload: CrearPersonaPayload) => {
    const nuevaPersona = await crearPersona(payload).unwrap();
    refetchPersonas();
    // Abrir el diálogo guiado para preguntar si desea continuar al Paso 2
    if (nuevaPersona && nuevaPersona.id) {
      setStepPromptPersona(nuevaPersona);
    } else {
      showNotification(`Persona "${payload.nombre}" registrada exitosamente.`);
    }
  };

  const handleSavePersonaUpdate = async (payload: ActualizarPersonaPayload) => {
    await actualizarPersona(payload).unwrap();
    showNotification("Datos de la persona actualizados correctamente.");
    refetchPersonas();
  };

  const handleConfirmDeletePersona = async (id: number) => {
    await eliminarPersona(id).unwrap();
    showNotification("Persona eliminada del padrón satisfactoriamente.");
    refetchPersonas();
    refetchUsuarios();
  };

  // -------------------------------------------------------------
  // Flujo Paso 2: Crear Cuenta de Usuario
  // -------------------------------------------------------------
  const handleOpenCrearUsuario = (personaPreseleccionada?: Persona) => {
    setEditingUsuario(null);
    setSelectedPersonaForUser(personaPreseleccionada || null);
    setIsUsuarioModalOpen(true);
  };

  const handleEditUsuario = (u: Usuario) => {
    setEditingUsuario(u);
    setSelectedPersonaForUser(null);
    setIsUsuarioModalOpen(true);
  };

  const handleDeleteUsuario = (u: Usuario) => {
    setDeletingUsuario(u);
  };

  const handleSaveUsuarioCreate = async (payload: CrearUsuarioPayload) => {
    await crearUsuario(payload).unwrap();
    showNotification("Cuenta de acceso creada exitosamente en el servidor.");
    refetchUsuarios();
    refetchPersonas();
    setSelectedPersonaForUser(null);
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
    refetchPersonas();
  };

  // Continuar del Paso 1 al Paso 2
  const handleContinuarPaso2 = () => {
    if (!stepPromptPersona) return;
    const persona = stepPromptPersona;
    setStepPromptPersona(null);
    handleOpenCrearUsuario(persona);
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
              Gestión de cuentas de usuario y padrón de personas del sistema. Flujo por pasos: primero registra la persona y luego crea su cuenta.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Input de búsqueda reactivo */}
            <div className="relative w-full sm:w-auto sm:min-w-[260px]">
              <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  activeTab === "cuentas"
                    ? "Buscar por usuario, nombre o DNI..."
                    : "Buscar por nombre, DNI o expediente..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field pl-10 pr-4 py-2 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
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

              {/* Botón Paso 1: Registrar Persona */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenRegistrarPersona}
                className="font-bold text-carbon hover:text-guinda border-linea shadow-xs h-9 px-3 shrink-0"
                title="Paso 1: Da de alta a la persona en el padrón civil"
              >
                <UserPlus className="w-4 h-4 mr-1.5 text-guinda" />
                1. Registrar Persona
              </Button>

              {/* Botón Paso 2: Crear Cuenta */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenCrearUsuario()}
                className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold shrink-0 shadow-xs h-9 px-3.5"
                title="Paso 2: Asigna credenciales y rol a una persona registrada"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5 text-white" />
                2. Crear Cuenta
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
          onCrearCuenta={(persona) => handleOpenCrearUsuario(persona)}
          onRetry={() => refetchPersonas()}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* Paso 1: Modal Registrar / Editar Persona                      */}
      {/* ------------------------------------------------------------- */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => {
          setIsPersonaModalOpen(false);
          setEditingPersona(null);
        }}
        personaToEdit={editingPersona}
        onSaveCreate={handleSavePersonaCreate}
        onSaveUpdate={handleSavePersonaUpdate}
        isLoading={isCreatingPersona || isUpdatingPersona}
      />

      {/* ------------------------------------------------------------- */}
      {/* Modal Guiado: Pregunta si desea continuar al Paso 2          */}
      {/* ------------------------------------------------------------- */}
      {stepPromptPersona && (
        <Modal
          isOpen={Boolean(stepPromptPersona)}
          onClose={() => setStepPromptPersona(null)}
          title="¡Paso 1 Completado: Persona Registrada!"
          description="La persona fue dada de alta satisfactoriamente en el padrón central."
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  showNotification(`Persona "${stepPromptPersona.nombre}" registrada en el padrón.`);
                  setStepPromptPersona(null);
                }}
              >
                Solo Registrar Persona
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleContinuarPaso2}
                className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold"
              >
                <span>Continuar a Paso 2: Crear Cuenta</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3.5 rounded-field bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-emerald-950">
                  {stepPromptPersona.nombre}
                </p>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  DNI: <strong>{stepPromptPersona.dni}</strong> • ID en padrón: #{stepPromptPersona.id}
                  {stepPromptPersona.expediente ? ` • Exp: ${stepPromptPersona.expediente}` : ""}
                </p>
              </div>
            </div>

            <p className="text-carbon leading-relaxed">
              ¿Deseas crear su <strong>cuenta de acceso al sistema</strong> ahora mismo? Si continúas, se abrirá el formulario para asignarle su usuario, contraseña y rol.
            </p>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Paso 2: Modal Crear / Editar Cuenta de Usuario                */}
      {/* ------------------------------------------------------------- */}
      <UsuarioModal
        isOpen={isUsuarioModalOpen}
        onClose={() => {
          setIsUsuarioModalOpen(false);
          setEditingUsuario(null);
          setSelectedPersonaForUser(null);
        }}
        usuarioToEdit={editingUsuario}
        initialPersona={selectedPersonaForUser}
        onSaveCreate={handleSaveUsuarioCreate}
        onSaveUpdate={handleSaveUsuarioUpdate}
        isLoading={isCreatingUsuario || isUpdatingUsuario}
      />

      {/* Modal Confirmación Eliminar Persona del Padrón */}
      <EliminarPersonaModal
        isOpen={Boolean(deletingPersona)}
        onClose={() => setDeletingPersona(null)}
        persona={deletingPersona}
        onConfirm={handleConfirmDeletePersona}
        isLoading={isDeletingPersona}
      />

      {/* Modal Confirmación Eliminar Cuenta de Usuario */}
      <EliminarUsuarioModal
        isOpen={Boolean(deletingUsuario)}
        onClose={() => setDeletingUsuario(null)}
        usuario={deletingUsuario}
        onConfirm={handleConfirmDeleteUsuario}
        isLoading={isDeletingUsuario}
      />
    </div>
  );
}

export default CuentasAccesoPage;
