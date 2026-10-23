import { useState, useEffect, useMemo } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import {
  ShieldCheck,
  Check,
  Loader2,
  AlertCircle,
  Layers,
} from "lucide-react";
import {
  useGetPantallasQuery,
  useGetRolPantallasQuery,
  useAsignarRolPantallasMutation,
} from "../services/pantallasApi";
import type { Pantalla } from "../types/pantalla.types";
import type { Rol } from "@/features/roles/types/rol.types";

interface AsignarPantallasModalProps {
  isOpen: boolean;
  onClose: () => void;
  rol: Rol | null;
  onSuccess?: () => void;
}

export function AsignarPantallasModal({
  isOpen,
  onClose,
  rol,
  onSuccess,
}: AsignarPantallasModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: allPantallasData } = useGetPantallasQuery(undefined, {
    skip: !isOpen,
  });
  const allPantallas = allPantallasData || [];

  const rolId = rol?.id;
  const {
    data: pantallasData,
    isLoading,
    isError,
    refetch,
  } = useGetRolPantallasQuery(rolId as number, {
    skip: !isOpen || !rolId,
  });

  const [asignarPantallas, { isLoading: isSaving }] =
    useAsignarRolPantallasMutation();

  // Inicializar selección cuando cargan las pantallas del rol
  useEffect(() => {
    if (!isOpen || !rolId) return;

    if (pantallasData && Array.isArray(pantallasData)) {
      const assigned = pantallasData
        .filter((p) => Boolean(p.asignada))
        .map((p) => p.id);
      setSelectedIds(assigned);
    }
  }, [isOpen, rolId, pantallasData]);

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

  const handleSave = async () => {
    if (!rolId) return;
    setErrorMsg(null);
    try {
      await asignarPantallas({
        rolId,
        pantalla_ids: selectedIds,
      }).unwrap();

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; mensaje?: string } };
      setErrorMsg(
        error?.data?.message ||
          error?.data?.mensaje ||
          "Ocurrió un error al guardar los permisos de pantallas."
      );
    }
  };

  const getGrupoTitle = (key: string) => {
    switch (key) {
      case "proceso":
        return "Módulos de Proceso y Seguimiento Judicial";
      case "administracion":
        return "Administración y Seguridad";
      case "sistema":
        return "Parámetros y Sistema";
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  if (!isOpen || !rol) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos de Pantallas: ${rol.nombre}`}
      description="Selecciona los módulos y vistas visibles a los usuarios que tengan este rol."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-olivo font-semibold">
            <span className="font-bold text-carbon">{selectedIds.length}</span> de{" "}
            <span className="font-bold text-carbon">{displayPantallas.length}</span> pantallas permitidas
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Guardar Permisos
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-tile text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Barra superior de acciones rápidas */}
        <div className="flex items-center justify-between bg-suave/70 p-3 rounded-tile border border-linea/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-guinda" />
            <span className="text-xs font-bold text-carbon">
              Rol: <span className="font-mono text-guinda">{rol.codigo}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs font-bold text-olivo hover:text-carbon h-7 px-2.5"
            >
              Marcar todas
            </Button>
            <span className="text-linea text-xs">•</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="text-xs font-bold text-olivo hover:text-carbon h-7 px-2.5"
            >
              Desmarcar
            </Button>
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="p-12 flex flex-col items-center justify-center gap-2.5 text-olivo">
            <Loader2 className="w-6 h-6 animate-spin text-guinda" />
            <span className="text-xs font-semibold text-carbon">
              Cargando catálogo de pantallas...
            </span>
          </div>
        )}

        {isError && (
          <div className="p-6 text-center space-y-2 border border-rose-200 rounded-tile">
            <p className="text-xs text-rose-700">No se pudieron cargar las pantallas del rol.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Lista de pantallas por grupo */}
        {!isLoading && !isError && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {Object.entries(groupedPantallas).map(([grupoKey, lista]) => {
              if (lista.length === 0) return null;
              return (
                <div key={grupoKey} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-carbon border-b border-linea/60 pb-1">
                    <Layers className="w-3.5 h-3.5 text-olivo" />
                    <span>{getGrupoTitle(grupoKey)}</span>
                    <Badge variant="default" className="text-[10px] py-0 px-1.5">
                      {lista.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lista.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-3 p-3 rounded-tile border text-xs cursor-pointer transition select-none ${
                            isSelected
                              ? "bg-guinda/5 border-guinda text-carbon shadow-2xs"
                              : "bg-white border-linea/80 text-carbon hover:bg-suave/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleScreen(p.id)}
                            className="mt-0.5 rounded accent-guinda h-4 w-4 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-carbon truncate">
                                {p.nombre}
                              </span>
                              <span className="font-mono text-[10px] text-olivo/70 shrink-0">
                                /{p.codigo}
                              </span>
                            </div>
                            {p.descripcion && (
                              <p className="text-[11px] text-olivo mt-0.5 line-clamp-1">
                                {p.descripcion}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
