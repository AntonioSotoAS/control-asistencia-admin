import { Card, CardHeader, CardTitle, CardDescription, Badge } from "@/components/ui";
import type { ActividadReciente } from "../types/dashboard.types";

interface RecentActivityListProps {
  data?: ActividadReciente[];
}

export function RecentActivityList({ data = [] }: RecentActivityListProps) {
  const items = data;

  const getBadgeVariant = (estado: ActividadReciente["estado"]) => {
    switch (estado) {
      case "PRESENTE":
        return "success";
      case "TARDANZA":
        return "warning";
      case "FALTA":
        return "danger";
      case "JUSTIFICADO":
        return "olivo";
      default:
        return "default";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Actividad y Marcaciones Recientes</CardTitle>
          <CardDescription>
            Últimos registros de asistencia transmitidos
          </CardDescription>
        </div>
      </CardHeader>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-olivo">
            No hay marcaciones o actividad reciente para mostrar.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-tile bg-suave/50 hover:bg-suave border border-linea/60 transition-colors"
            >
              <div className="flex flex-col min-w-0 pr-3">
                <span className="font-bold text-sm text-carbon truncate">
                  {item.beneficiario}
                </span>
                <div className="flex items-center gap-2 text-xs text-olivo mt-0.5">
                  <span>DNI: {item.dni}</span>
                  <span>•</span>
                  <span className="truncate">{item.hito}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant={getBadgeVariant(item.estado)}>
                  {item.estado}
                </Badge>
                <span className="text-[11px] font-semibold text-olivo">
                  {item.hora}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
