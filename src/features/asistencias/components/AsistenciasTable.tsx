import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/ui";
import { QrCode, ScanFace, FileEdit, CalendarCheck } from "lucide-react";
import type { Asistencia } from "../types/asistencia.types";

interface AsistenciasTableProps {
  asistencias: Asistencia[];
  isLoading?: boolean;
}

export function AsistenciasTable({
  asistencias,
  isLoading,
}: AsistenciasTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo">
        Cargando registro de asistencias...
      </div>
    );
  }

  if (asistencias.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center">
        <CalendarCheck className="w-12 h-12 text-olivo/40 mx-auto mb-3" />
        <h4 className="text-base font-bold text-carbon">
          No hay marcaciones de asistencia encontradas
        </h4>
        <p className="text-xs text-olivo mt-1">
          Utiliza el botón de marcar asistencia o selecciona otro filtro.
        </p>
      </div>
    );
  }

  const getMethodIcon = (metodo: Asistencia["metodo"]) => {
    switch (metodo) {
      case "QR":
        return <QrCode className="w-3.5 h-3.5 text-guinda" />;
      case "BIOMETRICO":
        return <ScanFace className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <FileEdit className="w-3.5 h-3.5 text-olivo" />;
    }
  };

  const getBadgeVariant = (estado: Asistencia["estado"]) => {
    switch (estado) {
      case "PRESENTE":
        return "success";
      case "TARDANZA":
        return "warning";
      case "JUSTIFICADO":
        return "olivo";
      case "FALTA":
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
          <TableHead>Hito / Evento</TableHead>
          <TableHead>Fecha y Hora</TableHead>
          <TableHead>Método</TableHead>
          <TableHead className="text-right">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {asistencias.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <span className="font-bold text-carbon block">
                {item.beneficiarioNombre}
              </span>
              {item.observacion && (
                <span className="text-[11px] text-olivo italic">
                  Obs: {item.observacion}
                </span>
              )}
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
            <TableCell>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-carbon">{item.hora}</span>
                <span className="text-[11px] text-olivo">{item.fecha}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-suave/80 text-xs font-semibold">
                {getMethodIcon(item.metodo)}
                <span className="text-[11px]">{item.metodo}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Badge variant={getBadgeVariant(item.estado)}>
                {item.estado}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
