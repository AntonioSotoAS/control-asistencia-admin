import React from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Flag,
  CalendarCheck2,
  FileCheck2,
  BarChart3,
  UserCog,
  UserCheck,
  ShieldCheck,
  LogOut,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/services/authSlice";
import { useLogoutMutation } from "@/features/auth/services/authApi";
import { useGetJustificacionesQuery } from "@/features/justificaciones";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const navItems: NavItem[] = [
  { name: "Dashboard", to: "/", icon: LayoutDashboard },
  { name: "Beneficiarios", to: "/beneficiarios", icon: Users },
  { name: "Hitos", to: "/hitos", icon: Flag },
  { name: "Asistencias", to: "/asistencias", icon: CalendarCheck2 },
  {
    name: "Justificaciones",
    to: "/justificaciones",
    icon: FileCheck2,
  },
  { name: "Reportes", to: "/reportes", icon: BarChart3 },
  { name: "Usuarios", to: "/usuarios", icon: UserCog },
  { name: "Personas", to: "/personas", icon: UserCheck },
  { name: "Roles", to: "/roles", icon: ShieldCheck },
];

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authUser = useAppSelector((state) => state.auth.user);

  const { data: justificaciones } = useGetJustificacionesQuery(undefined, {
    skip: !authUser,
  });

  const pendingJustificaciones = justificaciones?.filter(
    (j) => (j.estado || "PENDIENTE").toUpperCase() === "PENDIENTE"
  ).length;

  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Proceder con el cierre local incluso si la red no responde
    }
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-linea/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-linea/70 bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-tile bg-guinda text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-carbon tracking-tight leading-tight">
                Control Asistencia
              </span>
              <span className="text-xs font-semibold text-olivo uppercase tracking-wider">
                Panel Administrativo
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-olivo hover:text-carbon hover:bg-suave lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-olivo/70">
            Módulos Principales
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-field text-sm font-semibold transition-all duration-150 group",
                    isActive
                      ? "bg-guinda text-white shadow-sm"
                      : "text-carbon hover:bg-suave hover:text-guinda"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-olivo group-hover:text-guinda"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {(() => {
                      const badgeValue =
                        item.to === "/justificaciones"
                          ? pendingJustificaciones && pendingJustificaciones > 0
                            ? pendingJustificaciones
                            : undefined
                          : item.badge;

                      if (!badgeValue) return null;

                      return (
                        <span
                          className={cn(
                            "text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors",
                            isActive
                              ? "bg-white text-guinda"
                              : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {badgeValue}
                        </span>
                      );
                    })()}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Profile & Logout footer */}
        <div className="p-4 border-t border-linea/70 bg-[#fdfdfc]">
          <div className="flex items-center justify-between p-3 rounded-tile bg-suave/60 border border-linea/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-olivo/20 text-olivo flex items-center justify-center font-bold text-sm shrink-0">
                {authUser?.nombre ? authUser.nombre.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-carbon truncate leading-tight">
                  {authUser?.nombre || "Administrador"}
                </p>
                <p className="text-[11px] text-olivo truncate">
                  {authUser?.rol || "Super Admin"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-olivo hover:text-red-700 hover:bg-red-50 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
