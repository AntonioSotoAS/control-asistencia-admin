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
import { CheckSquare, FileText, CheckCircle2 } from "lucide-react";
import type { Justificacion } from "../types/justificacion.types";

interface JustificacionesTableProps {
  justificaciones: Justificacion[];
  isLoading?: boolean;
  onReview: (item: Justificacion) => void;
}

export function JustificacionesTable({
  justificaciones,
  isLoading,
  onReview,
}: JustificacionesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo">
        Cargando solicitudes de justificación...
      </div>
    );
  }

  if (justificaciones.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
        <h4 className="text-base font-bold text-carbon">
          Bandeja de justificaciones al día
        </h4>
        <p className="text-xs text-olivo mt-1">
          No hay solicitudes pendientes de revisión.
        </p>
      </div>
    );
  }

  const getBadgeVariant = (estado: Justificacion["estado"]) => {
    switch (estado) {
      case "PENDIENTE":
        return "warning";
      case "APROBADA":
        return "success";
      case "RECHAZADA":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Beneficiario</TableHead>
          <TableHead>DNI</TableHead>
          <TableHead>Hito Asociado</TableHead>
          <TableHead>Motivo / Sustento</TableHead>
          <TableHead>Fecha Solicitud</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {justificaciones.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <span className="font-bold text-carbon block">
                {item.beneficiarioNombre}
              </span>
            </TableCell>
            <TableCell>
              <span className="font-mono font-semibold text-carbon bg-suave px-2 py-0.5 rounded-md text-xs">
                {item.beneficiarioDni}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-xs font-medium text-carbon">
                {item.hitoNombre}
              </span>
            </TableCell>
            <TableCell className="max-w-xs">
              <p className="text-xs text-carbon truncate">
                {item.motivo}
              </p>
              {item.sustentoDocUrl && (
                <span className="inline-flex items-center gap-1 text-[11px] text-guinda font-semibold mt-0.5">
                  <FileText className="w-3 h-3" />
                  Ver documento adjunto
                </span>
              )}
            </TableCell>
            <TableCell>
              <span className="text-xs text-olivo font-semibold">
                {item.fechaSolicitud}
              </span>
            </TableCell>
            <TableCell>
              <Badge variant={getBadgeVariant(item.estado)}>
                {item.estado}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant={item.estado === "PENDIENTE" ? "primary" : "outline"}
                size="sm"
                onClick={() => onReview(item)}
                leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
              >
                {item.estado === "PENDIENTE" ? "Revisar" : "Detalle"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
