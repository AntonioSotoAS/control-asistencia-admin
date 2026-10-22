import { useLocation } from "react-router";
import { Menu, Search, Bell, Radio } from "lucide-react";
import { Badge } from "@/components/ui";
import { useAppSelector } from "@/app/hooks";

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Panel de Control",
    subtitle: "Resumen operativo en tiempo real",
  },
  "/beneficiarios": {
    title: "Gestión de Beneficiarios",
    subtitle: "Padrón general, enrolamiento y estados",
  },
  "/hitos": {
    title: "Hitos y Eventos",
    subtitle: "Configuración de sesiones y puntos de control",
  },
  "/asistencias": {
    title: "Control de Asistencias",
    subtitle: "Marcaciones biométricas, código QR y manuales",
  },
  "/justificaciones": {
    title: "Bandeja de Justificaciones",
    subtitle: "Revisión de solicitudes médicas y permisos",
  },
  "/reportes": {
    title: "Métricas y Reportes",
    subtitle: "Exportación consolidada e indicadores clave",
  },
  "/usuarios": {
    title: "Administración de Usuarios",
    subtitle: "Gestión de operadores, supervisores y permisos",
  },
  "/personas": {
    title: "Padrón de Personas",
    subtitle: "Registro de ciudadanos, beneficiarios y expedientes",
  },
};

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const location = useLocation();
  const currentRoute = routeTitles[location.pathname] || {
    title: "Control de Asistencia",
    subtitle: "Sistema Institucional",
  };
  const authUser = useAppSelector((state) => state.auth.user);

  const formattedDate = new Intl.DateTimeFormat("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <header className="h-20 bg-white/95 backdrop-blur-sm border-b border-linea/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-field text-carbon hover:bg-suave lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-carbon tracking-tight leading-tight">
            {currentRoute.title}
          </h1>
          <p className="text-xs text-olivo hidden sm:block">
            {currentRoute.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Quick Search */}
        <div className="relative hidden md:flex items-center w-64">
          <Search className="w-4 h-4 text-olivo/70 absolute left-3 pointer-events-none" />
          <input
            type="search"
            placeholder="Buscar por DNI o nombre..."
            className="w-full text-xs bg-suave/80 border border-linea rounded-full pl-9 pr-4 py-2 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
          />
        </div>

        {/* API connection indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-[11px]">API Conectada</span>
        </div>

        {/* Date Pill */}
        <Badge variant="olivo" className="hidden lg:inline-flex capitalize">
          {formattedDate}
        </Badge>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-full text-olivo hover:text-carbon hover:bg-suave transition"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-guinda" />
        </button>

        {/* User initials */}
        <div className="flex items-center gap-2 pl-2 border-l border-linea/80">
          <div className="w-9 h-9 rounded-full bg-guinda text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {authUser?.nombre ? authUser.nombre.charAt(0).toUpperCase() : "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
