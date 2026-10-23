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
import { Edit2, Trash2, Shield, AlertCircle, Loader2, KeyRound, Layers } from "lucide-react";
import { esRolProtegido, type Rol } from "../types/rol.types";

interface RolesTableProps {
  roles: Rol[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEdit: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
  onAssignPantallas?: (rol: Rol) => void;
  onRetry?: () => void;
}

export function RolesTable({
  roles,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onAssignPantallas,
  onRetry,
}: RolesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Consultando roles del sistema en el servidor...
        </p>
      </div>
    );
  }

  if (isError) {
    const err = error as { status?: number; data?: { message?: string; mensaje?: string } };
    const status = err?.status;
    let errorText = "No se pudieron consultar los roles del servidor.";

    if (status === 401) {
      errorText = "Tu sesión ha expirado o no tienes un token válido. Por favor inicia sesión nuevamente.";
    } else if (status === 403) {
      errorText = "Acceso denegado: Se requieren permisos de superadministrador.";
    } else if (err?.data?.message || err?.data?.mensaje) {
      errorText = (err.data.message || err.data.mensaje)!;
    }

    return (
      <div className="bg-white rounded-tile border border-rose-200 p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h4 className="text-base font-bold text-carbon">Error de Consulta</h4>
        <p className="text-xs text-rose-700 max-w-md mx-auto">{errorText}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            Reintentar Consulta
          </Button>
        )}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-2">
        <KeyRound className="w-12 h-12 text-olivo/40 mx-auto mb-2" />
        <h4 className="text-base font-bold text-carbon">
          No se encontraron roles de usuario
        </h4>
        <p className="text-xs text-olivo">
          Utiliza el botón superior para crear un nuevo rol de acceso.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">ID</TableHead>
          <TableHead>Código Identificador</TableHead>
          <TableHead>Nombre del Rol</TableHead>
          <TableHead>Tipo de Rol</TableHead>
          <TableHead>Fecha Creación</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((r) => {
          const isProtected = esRolProtegido(r.codigo);

          return (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs text-olivo">
                #{r.id}
              </TableCell>

              <TableCell>
                <span className="font-mono font-bold text-carbon bg-suave/80 px-2.5 py-1 rounded-md text-xs border border-linea/60">
                  {r.codigo}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-carbon">{r.nombre}</span>
                </div>
              </TableCell>

              <TableCell>
                {isProtected ? (
                  <Badge variant="guinda" className="gap-1">
                    <Shield className="w-3 h-3" />
                    Rol del Sistema
                  </Badge>
                ) : (
                  <Badge variant="default">Personalizado</Badge>
                )}
              </TableCell>

              <TableCell>
                <span className="text-xs text-olivo">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString("es-PE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Base"}
                </span>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssignPantallas?.(r)}
                    className="p-1.5 h-8 w-8 text-olivo hover:text-guinda"
                    title="Configurar permisos de pantallas"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(r)}
                    className="p-1.5 h-8 w-8 text-olivo hover:text-guinda"
                    title="Editar rol"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>

                  {isProtected ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="p-1.5 h-8 w-8 text-olivo/30 cursor-not-allowed"
                      title="Los roles base del sistema no pueden eliminarse"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(r)}
                      className="p-1.5 h-8 w-8 text-olivo hover:text-red-700"
                      title="Eliminar rol"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
