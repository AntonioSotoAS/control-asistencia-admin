import { HitoCard } from "./HitoCard";
import type { HitoAvance } from "../types/hito.types";
import { Flag, Loader2 } from "lucide-react";

interface HitosListProps {
  hitos: HitoAvance[];
  isLoading?: boolean;
  onAgendarFechas: (hito: HitoAvance) => void;
  onRevisar: (hito: HitoAvance) => void;
}

export function HitosList({
  hitos,
  isLoading,
  onAgendarFechas,
  onRevisar,
}: HitosListProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Consultando hitos y avance de asistencias en el servidor...
        </p>
      </div>
    );
  }

  if (hitos.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center">
        <Flag className="w-12 h-12 text-olivo/40 mx-auto mb-3" />
        <h4 className="text-base font-bold text-carbon">
          No hay hitos registrados en el sistema
        </h4>
        <p className="text-xs text-olivo mt-1">
          Utiliza el botón de agendar fechas para programar las sesiones de asistencia.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {hitos.map((hito) => (
        <HitoCard
          key={hito.id}
          hito={hito}
          onAgendarFechas={onAgendarFechas}
          onRevisar={onRevisar}
        />
      ))}
    </div>
  );
}
