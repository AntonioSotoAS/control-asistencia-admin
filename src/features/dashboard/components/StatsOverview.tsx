import { Card } from "@/components/ui/Card";
import { Users, CheckCircle, AlertTriangle, Flag, ArrowUpRight } from "lucide-react";
import type { DashboardResumen } from "../types/dashboard.types";

interface StatsOverviewProps {
  data?: DashboardResumen;
  isLoading?: boolean;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  // Graceful fallback values for instant preview
  const stats = {
    totalBeneficiarios: data?.totalBeneficiarios ?? 480,
    asistenciaHoyPorcentaje: data?.asistenciaHoyPorcentaje ?? 91.5,
    justificacionesPendientes: data?.justificacionesPendientes ?? 3,
    hitosActivos: data?.hitosActivos ?? 4,
  };

  const cards = [
    {
      title: "Total Beneficiarios",
      value: stats.totalBeneficiarios.toLocaleString(),
      change: "+12 este mes",
      icon: Users,
      color: "bg-guinda text-white",
      bgSubtle: "bg-guinda/10 text-guinda",
    },
    {
      title: "Asistencia de Hoy",
      value: `${stats.asistenciaHoyPorcentaje}%`,
      change: "439 registrados hoy",
      icon: CheckCircle,
      color: "bg-emerald-700 text-white",
      bgSubtle: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Justificaciones Pendientes",
      value: stats.justificacionesPendientes,
      change: "Requieren revisión",
      icon: AlertTriangle,
      color: "bg-amber-600 text-white",
      bgSubtle: "bg-amber-50 text-amber-700",
    },
    {
      title: "Hitos Activos",
      value: stats.hitosActivos,
      change: "2 sesiones programadas hoy",
      icon: Flag,
      color: "bg-olivo text-white",
      bgSubtle: "bg-olivo/10 text-olivo",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} hoverable className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-olivo/90">
                {card.title}
              </span>
              <div className={`w-10 h-10 rounded-tile flex items-center justify-center ${card.color} shadow-xs`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl font-black text-carbon tracking-tight">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full ${card.bgSubtle}`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {card.change}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
