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
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { Info } from "lucide-react";
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
  { dia: "Dom", presentes: 0, tardanzas: 0, faltas: 0 },
];

export function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = data && data.length > 0 ? data : emptyWeekData;

  const totalAsistencias = chartData.reduce(
    (acc, item) =>
      acc + (item.presentes || 0) + (item.tardanzas || 0) + (item.faltas || 0),
    0
  );

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
      </CardHeader>

      {/* Indicador contextual de datos reales */}
      {totalAsistencias === 0 && (
        <div className="mx-6 mb-2 p-2.5 rounded-lg bg-surface-muted/60 border border-border-soft flex items-center gap-2 text-xs text-ink-secondary">
          <Info className="w-4 h-4 text-[#562599] shrink-0" />
          <span>
            No hay sesiones registradas para los días de esta semana en el sistema.
          </span>
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
