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
import { Edit2, Trash2, Users, AlertCircle, Loader2, Phone, Mail, Scale } from "lucide-react";
import type { Persona } from "../types/persona.types";

interface PersonasTableProps {
  personas: Persona[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEdit: (persona: Persona) => void;
  onDelete: (persona: Persona) => void;
  onRetry?: () => void;
}

export function PersonasTable({
  personas,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onRetry,
}: PersonasTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Cargando padrón de personas desde el servidor...
        </p>
      </div>
    );
  }

  if (isError) {
    const err = error as { status?: number; data?: { message?: string; mensaje?: string } };
    const status = err?.status;
    let errorText = "No se pudo consultar el padrón de personas.";

    if (status === 401) {
      errorText = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
    } else if (status === 403) {
      errorText = "Acceso denegado: Solo un administrador tiene permisos para gestionar personas.";
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
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-2">
        <Users className="w-12 h-12 text-olivo/40 mx-auto mb-2" />
        <h4 className="text-base font-bold text-carbon">
          No se encontraron personas registradas
        </h4>
        <p className="text-xs text-olivo">
          Utiliza el botón superior para registrar a la primera persona en el padrón.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">ID</TableHead>
          <TableHead>DNI</TableHead>
          <TableHead>Nombre Completo</TableHead>
          <TableHead>Expediente / Juzgado</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Seguimiento</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {personas.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs text-olivo">
              #{p.id}
            </TableCell>

            <TableCell>
              {p.dni ? (
                <span className="font-mono font-bold text-carbon bg-suave/80 px-2.5 py-1 rounded-md text-xs border border-linea/60">
                  {p.dni}
                </span>
              ) : (
                <span className="text-xs text-olivo/60 italic">—</span>
              )}
            </TableCell>

            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-carbon">{p.nombre}</span>
                {p.usuario ? (
                  <span className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Cuenta: {p.usuario.identificador} ({p.usuario.rol})
                  </span>
                ) : (
                  <span className="text-[11px] text-olivo/80 mt-0.5">
                    Sin cuenta de acceso
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell>
              {p.expediente || p.juzgado ? (
                <div className="flex flex-col text-xs space-y-0.5">
                  {p.expediente && (
                    <span className="font-mono font-semibold text-carbon flex items-center gap-1">
                      <Scale className="w-3 h-3 text-olivo shrink-0" />
                      {p.expediente}
                    </span>
                  )}
                  {p.juzgado && (
                    <span className="text-[11px] text-olivo truncate max-w-xs">
                      {p.juzgado}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-olivo/70">—</span>
              )}
            </TableCell>

            <TableCell>
              <div className="flex flex-col text-xs text-olivo space-y-0.5">
                {p.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-olivo/70 shrink-0" />
                    {p.telefono}
                  </span>
                )}
                {p.email && (
                  <span className="flex items-center gap-1 text-[11px] text-olivo/90 truncate max-w-[180px]">
                    <Mail className="w-3 h-3 text-olivo/70 shrink-0" />
                    {p.email}
                  </span>
                )}
                {!p.telefono && !p.email && (
                  <span className="text-olivo/60 italic text-[11px]">Sin contacto</span>
                )}
              </div>
            </TableCell>

            <TableCell>
              {p.seguimiento && p.seguimiento.trim() ? (
                <Badge
                  variant={
                    p.seguimiento.toLowerCase().includes("finalizado")
                      ? "olivo"
                      : p.seguimiento.toLowerCase().includes("pendiente")
                      ? "warning"
                      : "success"
                  }
                >
                  {p.seguimiento}
                </Badge>
              ) : (
                <span className="text-xs text-olivo/60 italic">—</span>
              )}
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(p)}
                  className="p-1.5 h-8 w-8 text-olivo hover:text-guinda"
                  title="Editar persona"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(p)}
                  className="p-1.5 h-8 w-8 text-olivo hover:text-red-700"
                  title="Eliminar persona"
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
