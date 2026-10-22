import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import type { ReporteItem } from "../types/reporte.types";

interface ResumenReporteCardsProps {
  items: ReporteItem[];
  isLoading?: boolean;
}

export function ResumenReporteCards({ items, isLoading }: ResumenReporteCardsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo">
        Generando consolidado de reportes...
      </div>
    );
  }

  const totalBeneficiarios = items.reduce((acc, curr) => acc + curr.totalInscritos, 0);
  const totalPresentes = items.reduce((acc, curr) => acc + curr.totalPresentes, 0);
  const promedioGeneral =
    totalBeneficiarios > 0
      ? Math.round((totalPresentes / totalBeneficiarios) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* High-level indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-olivo">
            Total Inscritos en Periodo
          </span>
          <div className="text-2xl font-black text-carbon mt-2">
            {totalBeneficiarios.toLocaleString()}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-olivo">
            Total Asistencias Registradas
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {totalPresentes.toLocaleString()}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-olivo">
            Tasa de Asistencia Efectiva
          </span>
          <div className="text-2xl font-black text-guinda mt-2">
            {promedioGeneral}%
          </div>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-6 pt-5 pb-3 border-b border-linea">
          <CardTitle>Rendimiento y Cumplimiento por Programa</CardTitle>
        </CardHeader>
        <Table className="border-0 rounded-none">
          <TableHeader>
            <TableRow>
              <TableHead>Programa</TableHead>
              <TableHead>Padrón</TableHead>
              <TableHead>Presentes</TableHead>
              <TableHead>Tardanzas</TableHead>
              <TableHead>Faltas</TableHead>
              <TableHead>Justificados</TableHead>
              <TableHead className="text-right">Efectividad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.programa}>
                <TableCell className="font-bold text-carbon">
                  {row.programa}
                </TableCell>
                <TableCell className="font-semibold">
                  {row.totalInscritos}
                </TableCell>
                <TableCell className="text-emerald-700 font-semibold">
                  {row.totalPresentes}
                </TableCell>
                <TableCell className="text-amber-700 font-semibold">
                  {row.totalTardanzas}
                </TableCell>
                <TableCell className="text-rose-700 font-semibold">
                  {row.totalFaltas}
                </TableCell>
                <TableCell className="text-olivo font-semibold">
                  {row.totalJustificados}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={row.porcentajeEfectividad >= 90 ? "success" : "warning"}
                  >
                    {row.porcentajeEfectividad}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
