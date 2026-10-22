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
import {
  Eye,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import type { Justificacion } from "../types/justificacion.types";

interface JustificacionesTableProps {
  justificaciones: Justificacion[];
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onViewDetail: (item: Justificacion) => void;
  onRetry?: () => void;
}

export function JustificacionesTable({
  justificaciones,
  isLoading,
  isError,
  error,
  onViewDetail,
  onRetry,
}: JustificacionesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Consultando justificaciones en el servidor...
        </p>
      </div>
    );
  }

  if (isError) {
    const err = error as { status?: number; data?: { message?: string; mensaje?: string } };
    const status = err?.status;
    let errorText = "No se pudieron consultar las justificaciones del servidor.";

    if (status === 401) {
      errorText = "Tu sesión ha expirado o no tienes un token válido. Por favor inicia sesión nuevamente.";
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

  if (justificaciones.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-2">
        <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-2" />
        <h4 className="text-base font-bold text-carbon">
          No hay justificaciones registradas
        </h4>
        <p className="text-xs text-olivo">
          No se encontraron solicitudes de inasistencia en esta sección.
        </p>
      </div>
    );
  }

  const getBadgeVariant = (estado?: string) => {
    switch (estado?.toUpperCase()) {
      case "APROBADA":
      case "APROBADO":
        return "success";
      case "RECHAZADA":
      case "RECHAZADO":
        return "danger";
      case "PENDIENTE":
      default:
        return "warning";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">ID</TableHead>
          <TableHead>Beneficiario</TableHead>
          <TableHead>DNI</TableHead>
          <TableHead>Sesión / Hito</TableHead>
          <TableHead>Motivo Declarado</TableHead>
          <TableHead>Fecha Inasistencia</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {justificaciones.map((item) => {
          const hasFile = Boolean(
            item.archivo || item.archivo_url || item.sustentoDocUrl
          );

          return (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-xs text-olivo">
                #{item.id}
              </TableCell>

              <TableCell>
                <span className="font-bold text-carbon block">
                  {item.beneficiarioNombre || "Beneficiario"}
                </span>
              </TableCell>

              <TableCell>
                <span className="font-mono font-semibold text-carbon bg-suave px-2 py-0.5 rounded-md text-xs border border-linea/60">
                  {item.beneficiarioDni || "—"}
                </span>
              </TableCell>

              <TableCell>
                <span className="text-xs font-semibold text-carbon">
                  {item.hitoNombre ||
                    (item.sesion_id ? `Sesión #${item.sesion_id}` : "General")}
                </span>
              </TableCell>

              <TableCell className="max-w-xs">
                <p className="text-xs text-carbon truncate font-medium">
                  {item.motivo}
                </p>
                {hasFile && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-guinda font-semibold mt-0.5">
                    <Paperclip className="w-3 h-3" />
                    Sustento adjunto
                  </span>
                )}
              </TableCell>

              <TableCell>
                <span className="text-xs text-olivo font-semibold">
                  {item.fecha || item.fechaSolicitud || "—"}
                </span>
              </TableCell>

              <TableCell>
                <Badge variant={getBadgeVariant(item.estado)}>
                  {item.estado || "PENDIENTE"}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(item)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Detalle
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
