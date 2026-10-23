import { Search, Filter, RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui";

interface BeneficiarioFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  seguimientoFilter: string;
  onSeguimientoFilterChange: (value: string) => void;
  estadoFilter: string;
  onEstadoFilterChange: (value: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  totalCount?: number;
}

export function BeneficiarioFilter({
  searchTerm,
  onSearchChange,
  seguimientoFilter,
  onSeguimientoFilterChange,
  estadoFilter,
  onEstadoFilterChange,
  onRefresh,
  isLoading,
  totalCount,
}: BeneficiarioFilterProps) {
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    seguimientoFilter !== "TODOS" ||
    estadoFilter !== "TODOS";

  const handleClearFilters = () => {
    onSearchChange("");
    onSeguimientoFilterChange("TODOS");
    onEstadoFilterChange("TODOS");
  };

  return (
    <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o número de expediente..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs sm:text-sm bg-suave/60 border border-linea rounded-field pl-10 pr-9 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-olivo/60 hover:text-carbon"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seguimiento select */}
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-olivo/70 absolute left-3 pointer-events-none" />
            <select
              value={seguimientoFilter}
              onChange={(e) => onSeguimientoFilterChange(e.target.value)}
              className="text-xs bg-suave/60 border border-linea rounded-field pl-8 pr-7 py-2.5 text-carbon font-semibold focus:outline-none focus:border-guinda focus:bg-white transition cursor-pointer"
            >
              <option value="TODOS">Todos los Seguimientos</option>
              <option value="en_curso">En Curso</option>
              <option value="cumple">Cumple</option>
              <option value="alerta">En Alerta</option>
              <option value="incumplimiento">Incumplimiento</option>
              <option value="culminado">Culminado</option>
            </select>
          </div>

          {/* Estado de Cuenta */}
          <div className="relative flex items-center">
            <select
              value={estadoFilter}
              onChange={(e) => onEstadoFilterChange(e.target.value)}
              className="text-xs bg-suave/60 border border-linea rounded-field px-3 py-2.5 text-carbon font-semibold focus:outline-none focus:border-guinda focus:bg-white transition cursor-pointer"
            >
              <option value="TODOS">Todas las Cuentas</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Solo Inactivos</option>
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-olivo hover:text-guinda font-semibold"
            >
              Restablecer
            </Button>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              isLoading={isLoading}
              className="h-9 px-3"
              title="Recargar beneficiarios"
            >
              <RotateCw className="w-3.5 h-3.5 text-olivo" />
            </Button>
          )}
        </div>
      </div>

      {/* Counter bar */}
      {typeof totalCount === "number" && (
        <div className="text-[11px] text-olivo font-medium flex items-center justify-between border-t border-linea/60 pt-2">
          <span>
            Mostrando <strong className="text-carbon font-bold">{totalCount}</strong>{" "}
            beneficiario(s) registrado(s)
          </span>
          {hasActiveFilters && (
            <span className="text-guinda font-semibold">Filtros aplicados</span>
          )}
        </div>
      )}
    </div>
  );
}
