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
import { Edit2, Trash2, LayoutGrid, AlertCircle, Loader2 } from "lucide-react";
import type { Pantalla } from "../types/pantalla.types";

interface PantallasTableProps {
  pantallas: Pantalla[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEdit: (pantalla: Pantalla) => void;
  onDelete: (pantalla: Pantalla) => void;
  onRetry?: () => void;
}

export function PantallasTable({
  pantallas,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onRetry,
}: PantallasTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Cargando catálogo de pantallas...
        </p>
      </div>
    );
  }

  if (isError) {
    const err = error as { status?: number; data?: { message?: string; mensaje?: string } };
    return (
      <div className="bg-white rounded-tile border border-rose-200 p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h4 className="text-base font-bold text-carbon">Error al consultar pantallas</h4>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          {err?.data?.message || err?.data?.mensaje || "No se pudo obtener el catálogo de pantallas."}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (pantallas.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-2">
        <LayoutGrid className="w-12 h-12 text-olivo/40 mx-auto mb-2" />
        <h4 className="text-base font-bold text-carbon">No se encontraron pantallas</h4>
        <p className="text-xs text-olivo">
          Crea una nueva pantalla o limpia los filtros de búsqueda.
        </p>
      </div>
    );
  }

  const getGrupoBadge = (grupo: string) => {
    switch (grupo?.toLowerCase()) {
      case "proceso":
        return <Badge variant="info">Proceso</Badge>;
      case "administracion":
        return <Badge variant="warning">Administración</Badge>;
      case "sistema":
      default:
        return <Badge variant="olivo">Sistema</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">Orden</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Nombre / Módulo</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead>Ruta Frontend</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pantallas.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs text-olivo">
              #{p.orden ?? p.id}
            </TableCell>

            <TableCell>
              <span className="font-mono font-bold text-carbon bg-suave/80 px-2 py-0.5 rounded-md text-xs border border-linea/60">
                {p.codigo}
              </span>
            </TableCell>

            <TableCell>
              <div>
                <p className="font-bold text-carbon text-xs">{p.nombre}</p>
                {p.descripcion && (
                  <p className="text-[11px] text-olivo line-clamp-1">{p.descripcion}</p>
                )}
              </div>
            </TableCell>

            <TableCell>{getGrupoBadge(p.grupo)}</TableCell>

            <TableCell>
              <span className="font-mono text-xs text-olivo bg-suave/40 px-2 py-0.5 rounded border border-linea/50">
                {p.ruta}
              </span>
            </TableCell>

            <TableCell>
              {p.activa ? (
                <Badge variant="success">Activa</Badge>
              ) : (
                <Badge variant="default">Inactiva</Badge>
              )}
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(p)}
                  className="p-1.5 h-8 w-8 text-olivo hover:text-guinda"
                  title="Editar pantalla"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(p)}
                  className="p-1.5 h-8 w-8 text-olivo hover:text-red-700"
                  title="Eliminar pantalla"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
