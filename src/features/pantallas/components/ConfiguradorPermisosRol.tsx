import { useState, useEffect, useMemo } from "react";
import { Button, Badge } from "@/components/ui";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  Layers,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
} from "lucide-react";
import {
  useGetPantallasQuery,
  useGetRolPantallasQuery,
  useAsignarRolPantallasMutation,
} from "../services/pantallasApi";
import type { Pantalla } from "../types/pantalla.types";
import type { Rol } from "@/features/roles/types/rol.types";

interface ConfiguradorPermisosRolProps {
  roles: Rol[];
  isLoadingRoles?: boolean;
}

export function ConfiguradorPermisosRol({
  roles,
  isLoadingRoles,
}: ConfiguradorPermisosRolProps) {
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [initialIds, setInitialIds] = useState<number[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Seleccionar por defecto el primer rol si no hay uno activo
  useEffect(() => {
    if (!selectedRolId && roles.length > 0) {
      setSelectedRolId(roles[0].id);
    }
  }, [roles, selectedRolId]);

  const currentRol = useMemo(() => {
    return roles.find((r) => r.id === selectedRolId) || roles[0] || null;
  }, [roles, selectedRolId]);

  // Consulta del catálogo maestro de pantallas como respaldo
  const { data: allPantallasData } = useGetPantallasQuery();
  const allPantallas = allPantallasData || [];

  const currentRolId = currentRol?.id;

  // Consulta de pantallas para el rol seleccionado: GET /api/roles/{rolId}/pantallas
  const {
    data: pantallasData,
    isLoading: isLoadingPantallas,
    isFetching,
    isError,
    refetch,
  } = useGetRolPantallasQuery(currentRolId as number, {
    skip: !currentRolId,
  });

  const [asignarPantallas, { isLoading: isSaving }] =
    useAsignarRolPantallasMutation();

  // Sincronizar selección inicial al cargar las pantallas del rol
  useEffect(() => {
    if (!currentRolId) return;

    if (pantallasData && Array.isArray(pantallasData)) {
      const assigned = pantallasData
        .filter((p) => Boolean(p.asignada))
        .map((p) => p.id);
      setSelectedIds(assigned);
      setInitialIds(assigned);
    }
  }, [pantallasData, currentRolId]);

  // Lista definitiva de pantallas a mostrar
  const displayPantallas = useMemo(() => {
    if (pantallasData && pantallasData.length > 0) return pantallasData;
    if (allPantallas.length > 0) {
      return allPantallas.map((p) => ({
        ...p,
        asignada: selectedIds.includes(p.id),
      }));
    }
    return [];
  }, [pantallasData, allPantallas, selectedIds]);

  const hasChanges = useMemo(() => {
    if (selectedIds.length !== initialIds.length) return true;
    return selectedIds.some((id) => !initialIds.includes(id));
  }, [selectedIds, initialIds]);

  // Agrupar pantallas por grupo (proceso, administracion, sistema)
  const groupedPantallas = useMemo(() => {
    const groups: Record<string, Pantalla[]> = {
      proceso: [],
      administracion: [],
      sistema: [],
    };

    displayPantallas.forEach((p) => {
      const g = (p.grupo || "sistema").toLowerCase();
      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    });

    return groups;
  }, [displayPantallas]);

  const toggleScreen = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(displayPantallas.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleReset = () => {
    setSelectedIds(initialIds);
  };

  const handleSave = async () => {
    if (!currentRol) return;
    setErrorMessage(null);
    setNotification(null);

    try {
      await asignarPantallas({
        rolId: currentRol.id,
        pantalla_ids: selectedIds,
      }).unwrap();

      setInitialIds(selectedIds);
      setNotification(
        `¡Permisos actualizados! El rol "${currentRol.nombre}" ahora tiene acceso a ${selectedIds.length} pantallas.`
      );

      setTimeout(() => {
        setNotification(null);
      }, 5000);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; mensaje?: string } };
      setErrorMessage(
        error?.data?.message ||
        error?.data?.mensaje ||
        "No se pudieron guardar los permisos. Verifica la conexión con el servidor."
      );
    }
  };

  const getGrupoTitle = (key: string) => {
    switch (key) {
      case "proceso":
        return "1. Módulos de Proceso Judicial y Asistencias";
      case "administracion":
        return "2. Administración y Seguridad";
      case "sistema":
        return "3. Parámetros y Configuración del Sistema";
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  if (isLoadingRoles) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-7 h-7 animate-spin text-guinda" />
        <p className="text-xs font-semibold text-carbon">Cargando roles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificación de éxito o error */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-tile bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selector de Roles en Pestañas Superiores */}
      <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-linea/60 pb-3">
          <div>
            <h3 className="text-sm font-black text-carbon flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-guinda" />
              Selecciona el Rol a Configurar:
            </h3>
            <p className="text-xs text-olivo">
              Elige el rol para activar o desactivar los módulos a los que tendrán acceso sus usuarios.
            </p>
          </div>

          {currentRol && (
            <Badge variant="guinda" className="font-mono text-xs px-2.5 py-1">
              Rol Activo: {currentRol.codigo}
            </Badge>
          )}
        </div>

        {/* Botones de roles */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {roles.map((r) => {
            const isSelected = r.id === currentRol?.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedRolId(r.id);
                  setNotification(null);
                  setErrorMessage(null);
                }}
                className={`px-4 py-2.5 rounded-field text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${isSelected
                  ? "bg-guinda text-white shadow-xs border border-guinda"
                  : "bg-suave/80 text-carbon hover:bg-white hover:text-guinda border border-linea/80"
                  }`}
              >
                <span>{r.nombre}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-white/20 text-white" : "bg-linea/60 text-olivo"
                    }`}
                >
                  {r.codigo}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Principal de Configuración de Permisos con Checks */}
      <div className="bg-white p-6 rounded-tile border border-linea/80 shadow-xs space-y-6">
        {/* Cabecera del Rol Seleccionado y Acciones Rápidas */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-suave/50 p-4 rounded-tile border border-linea/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-carbon">
                Permisos para: <span className="text-guinda">{currentRol?.nombre}</span>
              </span>
              <Badge variant="default" className="text-xs">
                {selectedIds.length} de {displayPantallas.length} permitidas
              </Badge>
            </div>
            <p className="text-xs text-olivo">
              Marca con un check (✅) las pantallas que este rol puede ver en el menú lateral.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs font-bold"
              disabled={isLoadingPantallas || isSaving}
            >
              Marcar Todas
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="text-xs font-bold"
              disabled={isLoadingPantallas || isSaving}
            >
              Desmarcar Todas
            </Button>

            {hasChanges && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-olivo hover:text-carbon"
                title="Deshacer cambios no guardados"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 inline" />
                Restablecer
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
              className="font-bold shadow-xs px-4"
              disabled={isLoadingPantallas}
            >
              {hasChanges ? "Guardar Cambios *" : "Guardar Permisos"}
            </Button>
          </div>
        </div>

        {/* Estado de Carga */}
        {(isLoadingPantallas || isFetching) && (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-olivo">
            <Loader2 className="w-8 h-8 animate-spin text-guinda" />
            <p className="text-xs font-semibold text-carbon">
              Consultando pantallas asignadas al rol...
            </p>
          </div>
        )}

        {/* Error al consultar pantallas */}
        {isError && !isLoadingPantallas && (
          <div className="p-8 text-center space-y-3 border border-rose-200 rounded-tile bg-rose-50/40">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h4 className="text-sm font-bold text-carbon">Error de consulta</h4>
            <p className="text-xs text-rose-700">No se pudieron cargar las pantallas de este rol.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Grid de Pantallas Agrupadas por Sección */}
        {!isLoadingPantallas && !isFetching && !isError && (
          <div className="space-y-6">
            {Object.entries(groupedPantallas).map(([grupoKey, lista]) => {
              if (lista.length === 0) return null;

              const totalEnGrupo = lista.length;
              const permitidasEnGrupo = lista.filter((p) => selectedIds.includes(p.id)).length;

              return (
                <div key={grupoKey} className="space-y-3">
                  {/* Título de la sección */}
                  <div className="flex items-center justify-between border-b border-linea/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-guinda" />
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-carbon">
                        {getGrupoTitle(grupoKey)}
                      </h4>
                    </div>

                    <span className="text-[11px] font-bold text-olivo">
                      {permitidasEnGrupo} de {totalEnGrupo} activas
                    </span>
                  </div>

                  {/* Tarjetas interactivas con Check */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lista.map((pantalla) => {
                      const isChecked = selectedIds.includes(pantalla.id);

                      return (
                        <div
                          key={pantalla.id}
                          onClick={() => toggleScreen(pantalla.id)}
                          className={`relative p-4 rounded-tile border transition-all duration-150 cursor-pointer select-none flex items-start gap-3.5 ${isChecked
                            ? "bg-emerald-50/40 border-emerald-300 shadow-2xs hover:bg-emerald-50/70"
                            : "bg-white border-linea/80 hover:bg-suave/60 hover:border-linea opacity-75 hover:opacity-100"
                            }`}
                        >
                          {/* Checkbox visual */}
                          <div className="pt-0.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleScreen(pantalla.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 rounded-md accent-emerald-600 cursor-pointer"
                            />
                          </div>

                          {/* Contenido de la pantalla */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-bold text-xs text-carbon truncate">
                                {pantalla.nombre}
                              </h5>
                              {isChecked ? (
                                <Badge variant="success" className="text-[10px] py-0 px-1.5 shrink-0">
                                  <Unlock className="w-2.5 h-2.5 mr-0.5 inline" />
                                  Permitido
                                </Badge>
                              ) : (
                                <Badge variant="default" className="text-[10px] py-0 px-1.5 shrink-0 text-olivo/70">
                                  <Lock className="w-2.5 h-2.5 mr-0.5 inline" />
                                  Sin acceso
                                </Badge>
                              )}
                            </div>

                            <p className="text-[11px] font-mono text-olivo/80 mt-0.5">
                              Ruta: <span className="font-semibold text-carbon">{pantalla.ruta}</span>{" "}
                              <span className="text-olivo/50">({pantalla.codigo})</span>
                            </p>

                            {pantalla.descripcion && (
                              <p className="text-[11px] text-olivo mt-1 line-clamp-2">
                                {pantalla.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Barra inferior fija de guardado */}
        <div className="pt-4 border-t border-linea/80 flex items-center justify-between">
          <div className="text-xs text-olivo">
            {hasChanges ? (
              <span className="text-amber-800 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 inline" />
                Hay cambios pendientes por guardar para este rol.
              </span>
            ) : (
              <span className="text-olivo font-semibold">
                Todos los cambios están guardados en la base de datos.
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="font-bold px-6 shadow-sm"
            disabled={isLoadingPantallas}
          >
            Guardar Permisos de {currentRol?.nombre || "Rol"}
          </Button>
        </div>
      </div>
    </div>
  );
}
