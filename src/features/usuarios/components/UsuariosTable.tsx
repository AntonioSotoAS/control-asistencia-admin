import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from "@/components/ui";
import { Edit2 } from "lucide-react";
import type { Usuario } from "../types/usuario.types";

interface UsuariosTableProps {
  usuarios: Usuario[];
  isLoading?: boolean;
  onEdit: (usuario: Usuario) => void;
}

export function UsuariosTable({
  usuarios,
  isLoading,
  onEdit,
}: UsuariosTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo">
        Cargando usuarios del sistema...
      </div>
    );
  }

  const getRoleBadge = (rol: Usuario["rol"]) => {
    switch (rol) {
      case "ADMIN":
        return <Badge variant="guinda">Administrador</Badge>;
      case "SUPERVISOR":
        return <Badge variant="olivo">Supervisor</Badge>;
      default:
        return <Badge variant="default">Operador</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Identificador / Login</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Rol Asignado</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Último Acceso</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((u) => (
          <TableRow key={u.id}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-suave text-carbon flex items-center justify-center font-bold text-xs shrink-0">
                  {u.nombre.charAt(0)}
                </div>
                <span className="font-bold text-carbon">{u.nombre}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono font-semibold text-carbon bg-suave px-2 py-0.5 rounded-md text-xs">
                {u.identificador}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-xs text-olivo font-medium">{u.correo}</span>
            </TableCell>
            <TableCell>{getRoleBadge(u.rol)}</TableCell>
            <TableCell>
              <Badge variant={u.activo ? "success" : "danger"}>
                {u.activo ? "ACTIVO" : "INACTIVO"}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-xs text-olivo">
                {u.ultimoAcceso || "Nunca"}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(u)}
                className="p-1.5 h-8 w-8"
                title="Editar usuario"
              >
                <Edit2 className="w-3.5 h-3.5 text-olivo hover:text-guinda" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
