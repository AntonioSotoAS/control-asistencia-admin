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
import { Edit2, Trash2, Users, AlertCircle, Loader2 } from "lucide-react";
import type { Usuario, RolUsuario } from "../types/usuario.types";

interface UsuariosTableProps {
  usuarios: Usuario[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
  onRetry?: () => void;
}

export function UsuariosTable({
  usuarios,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onRetry,
}: UsuariosTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Consultando cuentas de acceso en el servidor...
        </p>
      </div>
    );
  }

  if (isError) {
    const err = error as { status?: number; data?: { message?: string; mensaje?: string } };
    const status = err?.status;
    let errorText = "No se pudieron cargar los usuarios del servidor.";

    if (status === 401) {
      errorText = "Tu sesión ha expirado o no tienes un token válido. Por favor inicia sesión nuevamente.";
    } else if (status === 403) {
      errorText = "Acceso denegado: Solo un administrador tiene permisos para gestionar usuarios.";
    } else if (err?.data?.message || err?.data?.mensaje) {
      errorText = (err.data.message || err.data.mensaje)!;
    }

    return (
      <div className="bg-white rounded-tile border border-rose-200 p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h4 className="text-base font-bold text-carbon">Error de Comunicación</h4>
        <p className="text-xs text-rose-700 max-w-md mx-auto">{errorText}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            Reintentar Consulta
          </Button>
        )}
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-2">
        <Users className="w-12 h-12 text-olivo/40 mx-auto mb-2" />
        <h4 className="text-base font-bold text-carbon">
          No se encontraron cuentas de acceso
        </h4>
        <p className="text-xs text-olivo">
          No hay usuarios registrados con los criterios de búsqueda actuales.
        </p>
      </div>
    );
  }

  const getRoleBadge = (rol: RolUsuario) => {
    switch (rol) {
      case "superadmin":
        return <Badge variant="guinda">Superadmin</Badge>;
      case "admin":
        return <Badge variant="guinda">Admin</Badge>;
      case "asistente":
        return <Badge variant="olivo">Asistente</Badge>;
      case "beneficiario":
        return <Badge variant="info">Beneficiario</Badge>;
      case "juez":
        return <Badge variant="warning">Juez</Badge>;
      default:
        return <Badge variant="default">{rol}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">ID</TableHead>
          <TableHead>Identificador / Login</TableHead>
          <TableHead>Persona Vinculada</TableHead>
          <TableHead>Rol del Sistema</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((u) => {
          const personaNombre =
            u.persona?.nombres && u.persona?.apellidos
              ? `${u.persona.nombres} ${u.persona.apellidos}`
              : u.nombre || "Persona no vinculada";

          return (
            <TableRow key={u.id}>
              <TableCell className="font-mono text-xs text-olivo">
                #{u.id}
              </TableCell>

              <TableCell>
                <span className="font-mono font-bold text-carbon bg-suave/80 px-2.5 py-1 rounded-md text-xs border border-linea/60">
                  {u.identificador}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-carbon">{personaNombre}</span>
                  <span className="text-[11px] text-olivo">
                    ID Persona: #{u.persona_id}
                    {u.persona?.dni ? ` • DNI: ${u.persona.dni}` : ""}
                    {u.persona?.expediente ? ` • Exp: ${u.persona.expediente}` : ""}
                  </span>
                </div>
              </TableCell>

              <TableCell>{getRoleBadge(u.rol)}</TableCell>

              <TableCell>
                <Badge variant={u.estado === "activo" ? "success" : "danger"}>
                  {u.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>

              <TableCell>
                <span className="text-xs text-olivo">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(u)}
                    className="p-1.5 h-8 w-8 text-olivo hover:text-guinda"
                    title="Editar cuenta"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(u)}
                    className="p-1.5 h-8 w-8 text-olivo hover:text-red-700"
                    title="Eliminar cuenta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
