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
import { Scale, UserPlus, Calendar, AlertCircle, Loader2 } from "lucide-react";
import type { ActoProcesal } from "../types/actoProcesal.types";

interface ActosProcesalesTableProps {
  actos: ActoProcesal[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onRegistrarPersona: (docId?: string) => void;
  onRetry?: () => void;
}

export function ActosProcesalesTable({
  actos,
  isLoading,
  isError,
  error,
  onRegistrarPersona,
  onRetry,
}: ActosProcesalesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Consultando actos procesales de la Corte (/api/actos-procesales)...
        </p>
      </div>
    );
  }

  if (isError) {
    const err = error as { data?: { message?: string; mensaje?: string } };
    return (
      <div className="bg-white rounded-tile border border-rose-200 p-8 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h4 className="text-base font-bold text-carbon">Error de Consulta</h4>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          {err?.data?.message || err?.data?.mensaje || "No se pudieron cargar los actos procesales del servidor."}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (actos.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-2">
        <Scale className="w-12 h-12 text-olivo/40 mx-auto mb-2" />
        <h4 className="text-base font-bold text-carbon">
          No se encontraron actos procesales
        </h4>
        <p className="text-xs text-olivo">
          Prueba cambiando los criterios de filtro (número de expediente, DNI o fecha de ingreso).
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">ID</TableHead>
          <TableHead className="w-48">Expediente / Instancia</TableHead>
          <TableHead>Ciudadano / Parte</TableHead>
          <TableHead className="w-32">D.N.I.</TableHead>
          <TableHead>Acto / Sumilla</TableHead>
          <TableHead className="w-32">Fecha Ingreso</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {actos.map((acto) => {
          const nombreCompleto = [acto.x_nombres, acto.x_ape_paterno, acto.x_ape_materno]
            .filter(Boolean)
            .join(" ");

          const fechaStr = acto.f_ingreso_acto
            ? new Date(acto.f_ingreso_acto).toLocaleDateString("es-PE", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—";

          return (
            <TableRow key={acto.id} className="hover:bg-suave/40">
              <TableCell className="font-mono text-xs text-olivo">
                #{acto.id}
              </TableCell>

              <TableCell>
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-xs text-carbon block">
                    {acto.x_formato || acto.n_unico || "—"}
                  </span>
                  <span className="text-[11px] text-olivo truncate block max-w-xs">
                    {acto.x_nom_instancia || "—"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-carbon block">
                    {nombreCompleto || "Parte no identificada"}
                  </span>
                  {acto.l_tipo_parte && (
                    <Badge variant="olivo" className="text-[10px] px-1.5 py-0 uppercase">
                      {acto.l_tipo_parte}
                    </Badge>
                  )}
                </div>
              </TableCell>

              <TableCell className="font-mono font-bold text-xs text-carbon">
                {acto.x_doc_id || "—"}
              </TableCell>

              <TableCell className="max-w-xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-carbon block truncate">
                    {acto.x_desc_acto_procesal || acto.x_resolucion || "—"}
                  </span>
                  {acto.x_sumilla && (
                    <p className="text-[11px] text-olivo line-clamp-1">
                      {acto.x_sumilla}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-xs text-olivo flex items-center gap-1.5 pt-3">
                <Calendar className="w-3.5 h-3.5 text-olivo/70 shrink-0" />
                <span>{fechaStr}</span>
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onRegistrarPersona(acto.x_doc_id || undefined)}
                  leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  className="bg-[#562599] hover:bg-[#471e7f] text-white text-xs font-bold h-7 px-2.5 shadow-xs"
                  title="Registrar persona y cuenta a partir de este acto procesal"
                >
                  Registrar
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
