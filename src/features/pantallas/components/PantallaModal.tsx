import { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import type {
  Pantalla,
  CrearPantallaPayload,
  ActualizarPantallaPayload,
  GrupoPantalla,
} from "../types/pantalla.types";

interface PantallaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCreate: (payload: CrearPantallaPayload) => Promise<void>;
  onSaveUpdate: (payload: ActualizarPantallaPayload) => Promise<void>;
  pantallaToEdit?: Pantalla | null;
  isLoading?: boolean;
}

export function PantallaModal({
  isOpen,
  onClose,
  onSaveCreate,
  onSaveUpdate,
  pantallaToEdit,
  isLoading,
}: PantallaModalProps) {
  const isEditing = Boolean(pantallaToEdit);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupo, setGrupo] = useState<GrupoPantalla>("proceso");
  const [ruta, setRuta] = useState("");
  const [icono, setIcono] = useState("");
  const [orden, setOrden] = useState<number>(10);
  const [activa, setActiva] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pantallaToEdit) {
      setCodigo(pantallaToEdit.codigo || "");
      setNombre(pantallaToEdit.nombre || "");
      setDescripcion(pantallaToEdit.descripcion || "");
      setGrupo(pantallaToEdit.grupo || "proceso");
      setRuta(pantallaToEdit.ruta || "");
      setIcono(pantallaToEdit.icono || "");
      setOrden(pantallaToEdit.orden ?? 10);
      setActiva(pantallaToEdit.activa ?? true);
    } else {
      setCodigo("");
      setNombre("");
      setDescripcion("");
      setGrupo("proceso");
      setRuta("/");
      setIcono("");
      setOrden(10);
      setActiva(true);
    }
    setErrorMsg(null);
  }, [pantallaToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!codigo.trim()) {
      setErrorMsg("El código de la pantalla es obligatorio.");
      return;
    }
    if (!nombre.trim()) {
      setErrorMsg("El nombre de la pantalla es obligatorio.");
      return;
    }
    if (!ruta.trim()) {
      setErrorMsg("La ruta del frontend es obligatoria.");
      return;
    }

    try {
      if (isEditing && pantallaToEdit) {
        await onSaveUpdate({
          id: pantallaToEdit.id,
          codigo: codigo.trim().toLowerCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          grupo,
          ruta: ruta.trim(),
          icono: icono.trim() || undefined,
          orden: Number(orden) || 10,
          activa,
        });
      } else {
        await onSaveCreate({
          codigo: codigo.trim().toLowerCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          grupo,
          ruta: ruta.trim(),
          icono: icono.trim() || undefined,
          orden: Number(orden) || 10,
          activa,
        });
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string; mensaje?: string } };
      setErrorMsg(
        error?.data?.message ||
          error?.data?.mensaje ||
          "Error al guardar la pantalla."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar Pantalla #${pantallaToEdit?.id}` : "Nueva Pantalla del Sistema"}
      description={
        isEditing
          ? "Modifica los datos del módulo y su ruta asociada."
          : "Registra un nuevo módulo para asignación de permisos por rol."
      }
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {isEditing ? "Guardar Cambios" : "Crear Pantalla"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-tile text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Código Único *"
            placeholder="ej: reportes, hitos, pantallas"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
            disabled={isEditing}
          />

          <Input
            label="Nombre del Módulo *"
            placeholder="ej: Reportes Consolidados"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ruta Frontend *"
            placeholder="ej: /reportes, /hitos"
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-carbon">
              Grupo de Menú *
            </label>
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value as GrupoPantalla)}
              className="w-full text-xs font-semibold bg-white border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda"
            >
              <option value="proceso">Proceso (Módulos operativos)</option>
              <option value="administracion">Administración (Usuarios/Roles)</option>
              <option value="sistema">Sistema (Configuración/Pantallas)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ícono (referencia)"
            placeholder="ej: fa-gauge-high, Layers"
            value={icono}
            onChange={(e) => setIcono(e.target.value)}
          />

          <Input
            label="Orden en el menú"
            type="number"
            value={orden}
            onChange={(e) => setOrden(Number(e.target.value))}
          />
        </div>

        <Input
          label="Descripción (opcional)"
          placeholder="ej: Permite emitir resúmenes de asistencia y actas judiciales"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-carbon">
            <input
              type="checkbox"
              checked={activa}
              onChange={(e) => setActiva(e.target.checked)}
              className="accent-guinda rounded h-4 w-4"
            />
            <span>Pantalla activa en el sistema</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
