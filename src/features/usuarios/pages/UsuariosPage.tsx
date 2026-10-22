import { useState } from "react";
import { UsuariosTable } from "../components/UsuariosTable";
import { UsuarioModal } from "../components/UsuarioModal";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import {
  useGetUsuariosQuery,
  useCrearUsuarioMutation,
  useActualizarUsuarioMutation,
} from "../services/usuariosApi";
import type { Usuario } from "../types/usuario.types";

const fallbackUsuarios: Usuario[] = [
  {
    id: 1,
    identificador: "admin",
    nombre: "Ana María Montalvo",
    rol: "ADMIN",
    correo: "admin@institucion.gob.pe",
    activo: true,
    ultimoAcceso: "2026-10-22 09:30 AM",
    fechaCreacion: "2026-01-01",
  },
  {
    id: 2,
    identificador: "sup.norte",
    nombre: "Víctor Raúl Haya",
    rol: "SUPERVISOR",
    correo: "vhaya@institucion.gob.pe",
    activo: true,
    ultimoAcceso: "2026-10-22 08:15 AM",
    fechaCreacion: "2026-01-15",
  },
  {
    id: 3,
    identificador: "op.lima01",
    nombre: "Lucía Paredes Silva",
    rol: "OPERADOR",
    correo: "lparedes@institucion.gob.pe",
    activo: true,
    ultimoAcceso: "2026-10-21 04:50 PM",
    fechaCreacion: "2026-02-01",
  },
  {
    id: 4,
    identificador: "op.lima02",
    nombre: "Gabriel Cárdenas",
    rol: "OPERADOR",
    correo: "gcardenas@institucion.gob.pe",
    activo: false,
    ultimoAcceso: "2026-09-30 02:10 PM",
    fechaCreacion: "2026-02-15",
  },
];

export function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  const { data: apiData, isLoading } = useGetUsuariosQuery();
  const [crearUsuario, { isLoading: isCreating }] = useCrearUsuarioMutation();
  const [actualizarUsuario, { isLoading: isUpdating }] = useActualizarUsuarioMutation();

  const [localData, setLocalData] = useState<Usuario[]>(fallbackUsuarios);
  const usuarios = apiData && apiData.length > 0 ? apiData : localData;

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: Usuario) => {
    setEditingUsuario(user);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Usuario> & { password?: string }) => {
    if (editingUsuario) {
      try {
        await actualizarUsuario({ id: editingUsuario.id, data }).unwrap();
      } catch {
        setLocalData((prev) =>
          prev.map((item) =>
            item.id === editingUsuario.id ? ({ ...item, ...data } as Usuario) : item
          )
        );
      }
    } else {
      try {
        await crearUsuario(data).unwrap();
      } catch {
        const newUser: Usuario = {
          id: Date.now(),
          identificador: data.identificador || "nuevo.usuario",
          nombre: data.nombre || "Nuevo Usuario",
          rol: data.rol || "OPERADOR",
          correo: data.correo || "",
          activo: data.activo ?? true,
          ultimoAcceso: "Nunca",
          fechaCreacion: new Date().toISOString().split("T")[0],
        };
        setLocalData((prev) => [newUser, ...prev]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-carbon tracking-tight">
            Gestión de Usuarios y Permisos
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Administra los roles y accesos para supervisores y operadores de campo.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          leftIcon={<UserPlus className="w-4 h-4" />}
          className="font-bold"
        >
          Nuevo Usuario
        </Button>
      </div>

      <UsuariosTable
        usuarios={usuarios}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        usuarioToEdit={editingUsuario}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

export default UsuariosPage;
