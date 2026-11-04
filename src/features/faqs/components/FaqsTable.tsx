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
import { Edit2, Trash2, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import type { Faq } from "../types/faq.types";

interface FaqsTableProps {
  faqs: Faq[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onEdit: (faq: Faq) => void;
  onDelete: (faq: Faq) => void;
  onRetry?: () => void;
}

export function FaqsTable({
  faqs,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onRetry,
}: FaqsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Cargando preguntas frecuentes desde el servidor (/api/faqs)...
        </p>
      </div>
    );
  }

  if (isError) {
    const err = error as { status?: number; data?: { message?: string; mensaje?: string } };
    const status = err?.status;
    let errorText = "No se pudieron cargar las preguntas frecuentes del servidor.";

    if (status === 401) {
      errorText = "Tu sesión ha expirado o no tienes un token válido. Por favor inicia sesión nuevamente.";
    } else if (status === 403) {
      errorText = "Acceso restringido: Solo administradores pueden gestionar el catálogo de preguntas frecuentes.";
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

  if (faqs.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-2">
        <HelpCircle className="w-12 h-12 text-olivo/40 mx-auto mb-2" />
        <h4 className="text-base font-bold text-carbon">
          No hay preguntas frecuentes registradas
        </h4>
        <p className="text-xs text-olivo">
          Crea tu primera pregunta frecuente para alimentar el catálogo y el asistente virtual.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">ID</TableHead>
          <TableHead className="w-1/3">Pregunta</TableHead>
          <TableHead>Respuesta</TableHead>
          <TableHead className="w-40">Palabras Clave</TableHead>
          <TableHead className="w-20 text-center">Orden</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {faqs.map((faq) => (
          <TableRow key={faq.id} className="hover:bg-suave/40">
            <TableCell className="font-mono text-xs text-olivo">
              #{faq.id}
            </TableCell>

            <TableCell>
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-carbon block">
                  {faq.pregunta}
                </span>
                {faq.slug && (
                  <span className="font-mono text-[11px] text-olivo">
                    slug: {faq.slug}
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell className="max-w-md">
              <p className="text-xs text-carbon/90 line-clamp-2 leading-relaxed">
                {faq.respuesta}
              </p>
            </TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-1">
                {faq.claves && faq.claves.length > 0 ? (
                  faq.claves.slice(0, 3).map((clave, idx) => (
                    <Badge key={idx} variant="default" className="text-[10px] px-1.5 py-0">
                      {clave}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[11px] text-olivo italic">General</span>
                )}
                {faq.claves && faq.claves.length > 3 && (
                  <span className="text-[10px] font-semibold text-olivo">
                    +{faq.claves.length - 3}
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell className="text-center font-mono text-xs font-bold text-olivo">
              {faq.orden ?? "—"}
            </TableCell>

            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(faq)}
                  className="p-1.5 h-8 w-8 text-olivo hover:text-guinda"
                  title="Editar pregunta"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(faq)}
                  className="p-1.5 h-8 w-8 text-olivo hover:text-red-700"
                  title="Eliminar pregunta"
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
