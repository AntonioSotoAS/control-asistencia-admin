import { Card, Badge, Button } from "@/components/ui";
import {
  Calendar,
  Clock,
  MapPin,
  CalendarPlus,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { HitoAvance } from "../types/hito.types";

interface HitoCardProps {
  hito: HitoAvance;
  onAgendarFechas: (hito: HitoAvance) => void;
  onRevisar: (hito: HitoAvance) => void;
}

export function HitoCard({
  hito,
  onAgendarFechas,
  onRevisar,
}: HitoCardProps) {
  const getBadgeVariant = (estado?: string) => {
    switch (estado?.toUpperCase()) {
      case "EN_CURSO":
      case "EN_PROGRESO":
        return "success";
      case "PROGRAMADO":
        return "info";
      case "FINALIZADO":
      case "CUMPLIDO":
        return "olivo";
      case "CANCELADO":
      case "OBSERVADO":
        return "danger";
      default:
        return "default";
    }
  };

  const attendancePercentage =
    typeof hito.porcentaje_avance === "number"
      ? hito.porcentaje_avance
      : hito.totalEsperados && hito.totalAsistieron
      ? Math.round((hito.totalAsistieron / hito.totalEsperados) * 100)
      : 0;

  const totalEsperados = hito.sesiones_requeridas || hito.totalEsperados || 1;
  const totalAsistieron = hito.sesiones_asistidas || hito.totalAsistieron || 0;

  return (
    <Card hoverable className="flex flex-col justify-between p-6">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant={getBadgeVariant(hito.estado)}>
            {(hito.estado || "PROGRAMADO").replace("_", " ")}
          </Badge>

          {hito.valido !== undefined && (
            <Badge variant={hito.valido ? "success" : "warning"} className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {hito.valido ? "Válido" : "Observado"}
            </Badge>
          )}
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
            <span>
              Fecha Hito:{" "}
              <strong className="font-semibold text-carbon">
                {hito.fecha_hito || hito.fecha}
              </strong>
            </span>
          </div>

          {hito.horaInicio && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-olivo/70 shrink-0" />
              <span>
                {hito.horaInicio} - {hito.horaFin} (Tol: {hito.toleranciaMinutos}m)
              </span>
            </div>
          )}

          {hito.ubicacion && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-olivo/70 shrink-0" />
              <span className="truncate">{hito.ubicacion}</span>
            </div>
          )}
        </div>

        {/* Avance de Asistencias */}
        <div className="mt-5 pt-4 border-t border-linea/60">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-olivo">Avance de Asistencias</span>
            <span className="text-carbon">
              {totalAsistieron} / {totalEsperados} ({attendancePercentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-suave rounded-full overflow-hidden">
            <div
              className="h-full bg-guinda rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, attendancePercentage)}%` }}
            />
          </div>
        </div>

        {/* Fechas agendadas preview */}
        {hito.fechas && hito.fechas.length > 0 && (
          <div className="mt-4 pt-3 border-t border-linea/40">
            <span className="text-[11px] font-bold text-olivo block mb-1">
              Sesiones Programadas ({hito.fechas.length}):
            </span>
            <div className="flex flex-wrap gap-1">
              {hito.fechas.slice(0, 4).map((f, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-suave text-carbon border border-linea/60"
                >
                  {f}
                </span>
              ))}
              {hito.fechas.length > 4 && (
                <span className="text-[11px] text-olivo self-center font-bold">
                  +{hito.fechas.length - 4} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción correspondientes a Swagger */}
      <div className="mt-5 pt-4 border-t border-linea/60 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAgendarFechas(hito)}
          leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-guinda" />}
          className="text-xs"
          title="Registrar las fechas de las sesiones del hito (POST /api/hitos/fechas)"
        >
          Agendar Fechas
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevisar(hito)}
          leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-olivo" />}
          className="text-xs text-olivo hover:text-carbon"
          title="Revisar validez de las fechas (PUT /api/hitos/{id}/revision)"
        >
          Revisar
        </Button>
      </div>
    </Card>
  );
}
