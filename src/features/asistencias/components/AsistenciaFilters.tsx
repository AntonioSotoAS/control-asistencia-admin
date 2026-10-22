import { Search, QrCode, Filter } from "lucide-react";
import { Button } from "@/components/ui";

interface AsistenciaFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onOpenRegistroModal: () => void;
}

export function AsistenciaFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenRegistroModal,
}: AsistenciaFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-tile border border-linea/80 shadow-xs">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por DNI o nombre del beneficiario..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-sm bg-suave/60 border border-linea rounded-field pl-10 pr-4 py-2 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
          />
        </div>

        <div className="relative hidden md:flex items-center">
          <Filter className="w-3.5 h-3.5 text-olivo/70 absolute left-3 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="text-xs bg-suave/60 border border-linea rounded-field pl-8 pr-6 py-2 text-carbon font-semibold focus:outline-none focus:border-guinda focus:bg-white transition cursor-pointer"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PRESENTE">Presente</option>
            <option value="TARDANZA">Tardanza</option>
            <option value="JUSTIFICADO">Justificado</option>
            <option value="FALTA">Falta</option>
          </select>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={onOpenRegistroModal}
        leftIcon={<QrCode className="w-4 h-4" />}
        className="font-bold shrink-0"
      >
        Marcar Asistencia
      </Button>
    </div>
  );
}
