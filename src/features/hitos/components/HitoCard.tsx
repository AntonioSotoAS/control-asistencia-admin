import { Card, Badge, Button } from "@/components/ui";
import { Calendar, Clock, MapPin, Edit2 } from "lucide-react";
import type { Hito } from "../types/hito.types";

interface HitoCardProps {
  hito: Hito;
  onEdit: (hito: Hito) => void;
}

export function HitoCard({ hito, onEdit }: HitoCardProps) {
  const getBadgeVariant = (estado: Hito["estado"]) => {
    switch (estado) {
      case "EN_CURSO":
        return "success";
      case "PROGRAMADO":
        return "info";
      case "FINALIZADO":
        return "olivo";
      case "CANCELADO":
        return "danger";
      default:
        return "default";
    }
  };

  const attendancePercentage =
    hito.totalEsperados && hito.totalAsistieron
      ? Math.round((hito.totalAsistieron / hito.totalEsperados) * 100)
      : 0;

  return (
    <Card hoverable className="flex flex-col justify-between p-6">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant={getBadgeVariant(hito.estado)}>
            {hito.estado.replace("_", " ")}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(hito)}
            className="p-1 h-7 w-7 text-olivo hover:text-guinda"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <h4 className="text-base font-extrabold text-carbon tracking-tight mb-1">
          {hito.nombre}
        </h4>
        {hito.descripcion && (
          <p className="text-xs text-olivo/90 line-clamp-2 mb-4">
            {hito.descripcion}
          </p>
        )}

        <div className="space-y-2 text-xs text-carbon/80 mt-4 pt-4 border-t border-linea/60">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-olivo/70 shrink-0" />
            <span className="font-semibold">{hito.fecha}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-olivo/70 shrink-0" />
            <span>
              {hito.horaInicio} - {hito.horaFin} (Tol: {hito.toleranciaMinutos}m)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-olivo/70 shrink-0" />
            <span className="truncate">{hito.ubicacion}</span>
          </div>
        </div>
      </div>

      {hito.totalEsperados ? (
        <div className="mt-5 pt-4 border-t border-linea/60">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-olivo">Asistencia</span>
            <span className="text-carbon">
              {hito.totalAsistieron || 0} / {hito.totalEsperados} ({attendancePercentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-suave rounded-full overflow-hidden">
            <div
              className="h-full bg-guinda rounded-full transition-all duration-300"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
