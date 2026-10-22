import { HitoCard } from "./HitoCard";
import type { Hito } from "../types/hito.types";
import { Flag } from "lucide-react";

interface HitosListProps {
  hitos: Hito[];
  isLoading?: boolean;
  onEdit: (hito: Hito) => void;
}

export function HitosList({ hitos, isLoading, onEdit }: HitosListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo">
        Cargando hitos y eventos...
      </div>
    );
  }

  if (hitos.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center">
        <Flag className="w-12 h-12 text-olivo/40 mx-auto mb-3" />
        <h4 className="text-base font-bold text-carbon">
          No hay hitos registrados
        </h4>
        <p className="text-xs text-olivo mt-1">
          Crea un nuevo hito para comenzar a programar sesiones y marcaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {hitos.map((hito) => (
        <HitoCard key={hito.id} hito={hito} onEdit={onEdit} />
      ))}
    </div>
  );
}
