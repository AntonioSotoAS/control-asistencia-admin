import { useState } from "react";
import { ReporteFiltros } from "../components/ReporteFiltros";
import { ResumenReporteCards } from "../components/ResumenReporteCards";
import { useGetReporteConsolidadoQuery } from "../services/reportesApi";
import type { ReporteItem, ReporteFiltrosState } from "../types/reporte.types";

const fallbackReporte: ReporteItem[] = [
  {
    programa: "Comedor Popular",
    totalInscritos: 180,
    totalPresentes: 168,
    totalTardanzas: 7,
    totalFaltas: 5,
    totalJustificados: 3,
    porcentajeEfectividad: 93,
  },
  {
    programa: "Vaso de Leche",
    totalInscritos: 150,
    totalPresentes: 139,
    totalTardanzas: 6,
    totalFaltas: 5,
    totalJustificados: 2,
    porcentajeEfectividad: 92,
  },
  {
    programa: "Pensión 65",
    totalInscritos: 90,
    totalPresentes: 85,
    totalTardanzas: 3,
    totalFaltas: 2,
    totalJustificados: 1,
    porcentajeEfectividad: 94,
  },
  {
    programa: "Capacitación Juvenil",
    totalInscritos: 60,
    totalPresentes: 51,
    totalTardanzas: 4,
    totalFaltas: 5,
    totalJustificados: 2,
    porcentajeEfectividad: 85,
  },
];

export function ReportesPage() {
  const [filtros, setFiltros] = useState<ReporteFiltrosState>({
    fechaInicio: "2026-10-01",
    fechaFin: "2026-10-22",
    programa: "TODOS",
  });

  const { data: apiData, isLoading } = useGetReporteConsolidadoQuery(filtros);
  const items = apiData && apiData.length > 0 ? apiData : fallbackReporte;

  const handleExportExcel = () => {
    alert("Generando archivo Excel consolidado con datos del periodo seleccionado...");
  };

  const handleExportPdf = () => {
    alert("Generando informe ejecutivo PDF formal con logotipo institucional...");
  };

  return (
    <div className="space-y-6">
      <ReporteFiltros
        filtros={filtros}
        onChangeFiltros={setFiltros}
        onExportarExcel={handleExportExcel}
        onExportarPdf={handleExportPdf}
      />

      <ResumenReporteCards items={items} isLoading={isLoading} />
    </div>
  );
}

export default ReportesPage;
