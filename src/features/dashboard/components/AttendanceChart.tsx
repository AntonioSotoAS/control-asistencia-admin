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

export function AttendanceChart({ data }: AttendanceChartProps) {
  const chartData = data && data.length > 0 ? data : emptyWeekData;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Tendencia de Asistencia Semanal</CardTitle>
          <CardDescription>
            Distribución de beneficiarios presentes, tardanzas y ausencias
          </CardDescription>
        </div>
      </CardHeader>

      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DB" vertical={false} />
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
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
              fill="#6E6A59"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="faltas"
              name="Faltas"
              fill="#D97706"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
