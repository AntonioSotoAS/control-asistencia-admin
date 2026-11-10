import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, Button } from "@/components/ui";
import {
  Star,
  RefreshCw,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useGetReporteSatisfaccionQuery } from "../services/satisfaccionApi";
import { DetalleSatisfaccionModal } from "./DetalleSatisfaccionModal";

export function SatisfaccionCard() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetReporteSatisfaccionQuery();

  const general = data?.general;
  const total = general?.total ?? 0;
  const promedio = general?.promedio ?? null;
  const actualizados = general?.actualizados ?? 0;
  const porNivel = general?.por_nivel || [
    { nivel: 5, etiqueta: "Muy satisfecho", total: 0 },
    { nivel: 4, etiqueta: "Satisfecho", total: 0 },
    { nivel: 3, etiqueta: "Neutral", total: 0 },
    { nivel: 2, etiqueta: "Insatisfecho", total: 0 },
    { nivel: 1, etiqueta: "Muy insatisfecho", total: 0 },
  ];

  // Ordenar de 5 a 1 estrellas
  const sortedNiveles = [...porNivel].sort((a, b) => b.nivel - a.nivel);

  const getBarColor = (nivel: number) => {
    switch (nivel) {
      case 5:
        return "bg-emerald-500";
      case 4:
        return "bg-[#562599]";
      case 3:
        return "bg-amber-500";
      case 2:
        return "bg-orange-500";
      case 1:
      default:
        return "bg-rose-500";
    }
  };

  const porcentajeAprobacion = promedio !== null ? Math.round((promedio / 5) * 100) : null;

  return (
    <>
      <Card className="h-full flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#562599]/10 text-[#562599] flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 fill-[#562599]" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-ink-primary">
                  Nivel de Satisfacción
                </CardTitle>
                <CardDescription className="text-xs text-ink-secondary">
                  Percepción del servicio por beneficiarios (/api/satisfaccion)
                </CardDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              isLoading={isFetching}
              className="h-8 w-8 p-0 text-ink-secondary hover:text-[#562599]"
              title="Actualizar reporte de satisfacción"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <div className="px-6 pb-2">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-ink-secondary">
                <Loader2 className="w-6 h-6 animate-spin text-[#562599]" />
                <p className="text-xs">Consultando reporte...</p>
              </div>
            ) : total === 0 ? (
              <div className="py-8 text-center text-ink-secondary space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-ink-tertiary" />
                <p className="text-sm font-bold text-ink-primary">Sin evaluaciones aún</p>
                <p className="text-xs text-ink-secondary max-w-xs mx-auto">
                  Las calificaciones registradas por los beneficiarios en la app móvil se reflejarán automáticamente aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Hero Rating Box */}
                <div className="p-3.5 rounded-xl bg-surface-muted/50 border border-border-soft flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-ink-primary tracking-tight">
                        {promedio !== null ? promedio.toFixed(1) : "—"}
                      </span>
                      <span className="text-xs font-bold text-ink-secondary">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            promedio !== null && star <= Math.round(promedio)
                              ? "fill-amber-400 text-amber-400"
                              : "text-border-soft"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    {porcentajeAprobacion !== null && (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        {porcentajeAprobacion}% Aprobación
                      </span>
                    )}
                    <span className="text-[11px] text-ink-secondary block mt-1">
                      {total} {total === 1 ? "beneficiario" : "beneficiarios"}
                    </span>
                  </div>
                </div>

                {/* Barras de Distribución por Nivel */}
                <div className="space-y-2">
                  {sortedNiveles.map((item) => {
                    const pct = total > 0 ? Math.round((item.total / total) * 100) : 0;
                    return (
                      <div key={item.nivel} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-ink-primary">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-bold text-[#562599] w-4">{item.nivel}★</span>
                            <span className="text-ink-secondary text-[11px]">{item.etiqueta}</span>
                          </span>
                          <span className="text-[11px] font-bold text-ink-primary">
                            {item.total}{" "}
                            <span className="text-ink-secondary font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getBarColor(
                              item.nivel
                            )}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-border-soft bg-surface-muted/20 flex items-center justify-between text-xs">
          <div className="text-[11px] text-ink-secondary">
            {actualizados > 0 ? (
              <span>
                <strong className="text-ink-primary">{actualizados}</strong> cambiaron su calificación
              </span>
            ) : (
              <span>Encuestas activas en app</span>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailOpen(true)}
            className="text-xs h-7 text-[#562599] hover:bg-[#562599]/10 font-bold px-2"
          >
            <span>Ver Detalle</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      </Card>

      {/* Modal Detallado con lista de personas */}
      <DetalleSatisfaccionModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}
