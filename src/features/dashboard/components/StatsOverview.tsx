import { Card } from "@/components/ui";
import {
  Users,
  AlertTriangle,
  Clock,
  AlertOctagon,
  ArrowUpRight,
} from "lucide-react";
import type { DashboardKPIS } from "../types/dashboard.types";

interface StatsOverviewProps {
  kpis?: DashboardKPIS;
  metrics?: Record<string, any> | null;
  isLoading?: boolean;
}

  export function StatsOverview({ kpis, metrics }: StatsOverviewProps) {
    const faltasVal = metrics?.total_faltas ?? metrics?.faltas ?? kpis?.totalFaltas ?? 0;
    const tardanzasVal = metrics?.total_tardanzas ?? metrics?.tardanzas ?? kpis?.totalTardanzas ?? 0;
    const justificacionesVal = metrics?.justificaciones_pendientes ?? metrics?.justificaciones ?? kpis?.justificacionesPendientes ?? 0;
    const beneficiariosVal = metrics?.beneficiarios ?? metrics?.total_beneficiarios ?? kpis?.totalBeneficiarios ?? 0;
    const totalUsersVal = metrics?.total_users ?? metrics?.totalUsuarios;

    const cards = [
      {
        title: "Inasistencias (Faltas)",
        value: faltasVal,
        change: "Requieren llamada urgente",
        icon: AlertOctagon,
        color: "bg-rose-700 text-white",
        bgSubtle: "bg-rose-50 text-rose-800 border border-rose-200",
      },
      {
        title: "Tardanzas Reportadas",
        value: tardanzasVal,
        change: "Ingresos fuera de hora",
        icon: Clock,
        color: "bg-amber-600 text-white",
        bgSubtle: "bg-amber-50 text-amber-800 border border-amber-200",
      },
      {
        title: "Justificaciones en Trámite",
        value: justificacionesVal,
        change: "Pendientes de revisión",
        icon: AlertTriangle,
        color: "bg-guinda text-white",
        bgSubtle: "bg-guinda/10 text-guinda border border-guinda/20",
      },
      {
        title: totalUsersVal !== undefined ? "Beneficiarios / Usuarios" : "Beneficiarios en Padrón",
        value: totalUsersVal !== undefined ? `${beneficiariosVal} / ${totalUsersVal}` : beneficiariosVal,
        change: totalUsersVal !== undefined ? "Padrón activo / Cuentas totales" : "Padrón institucional activo",
        icon: Users,
        color: "bg-emerald-700 text-white",
        bgSubtle: "bg-emerald-50 text-emerald-800 border border-emerald-200",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              hoverable
              className="p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-olivo/90">
                  {card.title}
                </span>
                <div
                  className={`w-10 h-10 rounded-tile flex items-center justify-center ${card.color} shadow-xs`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-black text-carbon tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${card.bgSubtle}`}
                  >
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
