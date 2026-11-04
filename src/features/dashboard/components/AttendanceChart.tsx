import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, Button } from "@/components/ui";
import { Info, Sparkles } from "lucide-react";
import type { TendenciaAsistencia } from "../types/dashboard.types";

interface AttendanceChartProps {
  data?: TendenciaAsistencia[];
}

const emptyWeekData: TendenciaAsistencia[] = [
  { dia: "Lun", presentes: 0, tardanzas: 0, faltas: 0 },
  { dia: "Mar", presentes: 0, tardanzas: 0, faltas: 0 },
  { dia: "Mié", presentes: 0, tardanzas: 0, faltas: 0 },
  { dia: "Jue", presentes: 0, tardanzas: 0, faltas: 0 },
  { dia: "Vie", presentes: 0, tardanzas: 0, faltas: 0 },
  { dia: "Sáb", presentes: 0, tardanzas: 0, faltas: 0 },
];

const demoWeekData: TendenciaAsistencia[] = [
  { dia: "Lun", presentes: 18, tardanzas: 3, faltas: 2 },
  { dia: "Mar", presentes: 22, tardanzas: 1, faltas: 1 },
  { dia: "Mié", presentes: 20, tardanzas: 4, faltas: 3 },
  { dia: "Jue", presentes: 25, tardanzas: 2, faltas: 0 },
  { dia: "Vie", presentes: 19, tardanzas: 5, faltas: 2 },
  { dia: "Sáb", presentes: 12, tardanzas: 1, faltas: 4 },
];

export function AttendanceChart({ data }: AttendanceChartProps) {
  const [showDemo, setShowDemo] = useState(false);

  const realData = data && data.length > 0 ? data : emptyWeekData;
  const totalReal = realData.reduce(
    (acc, item) =>
      acc + (item.presentes || 0) + (item.tardanzas || 0) + (item.faltas || 0),
    0
  );

  const chartData = showDemo ? demoWeekData : realData;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-bold text-ink-primary">
            Tendencia de Asistencia Semanal
          </CardTitle>
          <CardDescription className="text-xs text-ink-secondary">
            Distribución de beneficiarios presentes, tardanzas y ausencias por día
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1.5 h-8 px-2.5 border-dashed"
          onClick={() => setShowDemo(!showDemo)}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#562599]" />
          <span>{showDemo ? "Ver Datos Reales" : "Ver Ejemplo"}</span>
        </Button>
      </CardHeader>

      {/* Alerta contextual cuando no hay datos en la BD */}
      {!showDemo && totalReal === 0 && (
        <div className="mx-6 mb-2 p-2.5 rounded-lg bg-surface-muted/60 border border-border-soft flex items-center gap-2 text-xs text-ink-secondary">
          <Info className="w-4 h-4 text-[#562599] shrink-0" />
          <span>
            Sin registros de sesiones en la semana actual. Las barras se dibujarán automáticamente al registrar asistencias, o pulsa <strong>"Ver Ejemplo"</strong> para previsualizarlo.
          </span>
        </div>
      )}

      {showDemo && (
        <div className="mx-6 mb-2 p-2 rounded-lg bg-[#562599]/10 border border-[#562599]/20 flex items-center justify-between text-xs text-[#562599] font-medium">
          <span>Vista previa con datos de simulación activada.</span>
          <button
            onClick={() => setShowDemo(false)}
            className="underline text-xs hover:opacity-80"
          >
            Volver a datos reales
          </button>
        </div>
      )}

      <div className="w-full h-72 sm:h-80 pt-2 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E4E2DB"
              vertical={false}
            />
            <XAxis
              dataKey="dia"
              tickLine={false}
              axisLine={{ stroke: "#E4E2DB" }}
              tick={{ fill: "#6E6A59", fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#E4E2DB" }}
              tick={{ fill: "#6E6A59", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #E4E2DB",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
                fontFamily: "Nunito Variable, sans-serif",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
            />
            <Bar
              dataKey="presentes"
              name="Presentes"
              fill="#562599"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="tardanzas"
              name="Tardanzas"
              fill="#D97706"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="faltas"
              name="Faltas"
              fill="#EF4444"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
