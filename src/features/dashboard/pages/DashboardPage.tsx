import { StatsOverview } from "../components/StatsOverview";
import { AttendanceChart } from "../components/AttendanceChart";
import { RecentActivityList } from "../components/RecentActivityList";
import { QuickActions } from "../components/QuickActions";
import {
  useGetResumenQuery,
  useGetTendenciaQuery,
  useGetActividadRecienteQuery,
} from "../services/dashboardApi";

export function DashboardPage() {
  const { data: resumen, isLoading: isLoadingResumen } = useGetResumenQuery();
  const { data: tendencia } = useGetTendenciaQuery();
  const { data: actividad } = useGetActividadRecienteQuery();

  return (
    <div className="space-y-6">
      {/* Quick Action banner */}
      <QuickActions />

      {/* KPI Stats cards */}
      <StatsOverview data={resumen} isLoading={isLoadingResumen} />

      {/* 2-column Grid: Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart data={tendencia} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityList data={actividad} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
