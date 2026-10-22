import { Download, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui";
import type { ReporteFiltrosState } from "../types/reporte.types";

interface ReporteFiltrosProps {
  filtros: ReporteFiltrosState;
  onChangeFiltros: (filtros: ReporteFiltrosState) => void;
  onExportarExcel: () => void;
  onExportarPdf: () => void;
}

export function ReporteFiltros({
  filtros,
  onChangeFiltros,
  onExportarExcel,
  onExportarPdf,
}: ReporteFiltrosProps) {
  return (
    <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-olivo uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Fecha Desde
          </label>
          <input
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) =>
              onChangeFiltros({ ...filtros, fechaInicio: e.target.value })
            }
            className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda focus:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-olivo uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Fecha Hasta
          </label>
          <input
            type="date"
            value={filtros.fechaFin}
            onChange={(e) =>
              onChangeFiltros({ ...filtros, fechaFin: e.target.value })
            }
            className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda focus:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-olivo uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Programa Social
          </label>
          <select
            value={filtros.programa}
            onChange={(e) =>
              onChangeFiltros({ ...filtros, programa: e.target.value })
            }
            className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field px-3 py-2 text-carbon focus:outline-none focus:border-guinda focus:bg-white cursor-pointer"
          >
            <option value="TODOS">Todos los Programas</option>
            <option value="Vaso de Leche">Vaso de Leche</option>
            <option value="Comedor Popular">Comedor Popular</option>
            <option value="Pensión 65">Pensión 65</option>
            <option value="Capacitación Juvenil">Capacitación Juvenil</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 lg:pt-0 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          onClick={onExportarExcel}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Exportar Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportarPdf}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}
