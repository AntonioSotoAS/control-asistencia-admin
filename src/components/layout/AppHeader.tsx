import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Menu,
  Search,
  Bell,
  Radio,
  X,
  ArrowRight,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { setUser } from "@/features/auth/services/authSlice";
import {
  useCheckHealthQuery,
  useGetPerfilQuery,
} from "@/features/auth/services/authApi";
import { useGetBeneficiariosQuery } from "@/features/beneficiarios/services/beneficiariosApi";
import { usePWAInstall } from "@/shared/pwa";

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
    subtitle: "Padrón general, seguimiento judicial y control de hitos",
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
  "/roles": {
    title: "Catálogo de Roles y Permisos",
    subtitle: "Administración de perfiles de acceso para usuarios",
  },
  "/pantallas": {
    title: "Catálogo de Pantallas y Permisos por Rol",
    subtitle: "Gestión de módulos visibles y control de acceso por rol",
  },
};

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentRoute = routeTitles[location.pathname] || {
    title: "Control de Asistencia",
    subtitle: "Sistema Institucional",
  };
  const authUser = useAppSelector((state) => state.auth.user);
  const { isInstallable, promptInstall } = usePWAInstall();

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Query beneficiarios matching live search
  const shouldSearch = debouncedQuery.length >= 2;
  const {
    data: searchResults = [],
    isFetching: isSearching,
  } = useGetBeneficiariosQuery(
    { q: debouncedQuery },
    { skip: !shouldSearch }
  );

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectBeneficiario = (id: number, dni: string) => {
    setIsDropdownOpen(false);
    navigate(`/beneficiarios?q=${encodeURIComponent(dni)}&id=${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsDropdownOpen(false);
    navigate(`/beneficiarios?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const { data: healthData, isError: isHealthError } = useCheckHealthQuery(
    undefined,
    {
      pollingInterval: 30000,
    }
  );

  const dispatch = useAppDispatch();
  const { data: perfilData } = useGetPerfilQuery(undefined, {
    skip: !authUser,
  });

  // Sincronizar automáticamente las pantallas permitidas del perfil del usuario
  useEffect(() => {
    if (perfilData && authUser) {
      const pantallasFromPerfil =
        perfilData.pantallas ||
        perfilData.usuario?.pantallas;

      if (
        pantallasFromPerfil &&
        Array.isArray(pantallasFromPerfil) &&
        (!authUser.pantallas || authUser.pantallas.length !== pantallasFromPerfil.length)
      ) {
        dispatch(
          setUser({
            ...authUser,
            pantallas: pantallasFromPerfil,
          })
        );
      }
    }
  }, [perfilData, authUser, dispatch]);

  const isApiOnline =
    !isHealthError &&
    Boolean(healthData?.success || healthData?.data?.estado === "ok");

  const displayName = perfilData?.nombre || authUser?.nombre || "Administrador";

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
        {/* Quick Search with Live Beneficiario Lookup */}
        <div ref={searchContainerRef} className="relative hidden md:flex items-center w-72 lg:w-80">
          <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3 pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar beneficiario (DNI, nombre, exp)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isDropdownOpen) setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setIsDropdownOpen(true);
              }}
              className="w-full text-xs bg-suave/80 border border-linea rounded-full pl-9 pr-8 py-2 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2.5 p-0.5 rounded-full text-olivo/60 hover:text-carbon transition"
                aria-label="Borrar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Live Search Floating Popover */}
          {isDropdownOpen && shouldSearch && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-tile border border-linea/90 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2.5 bg-suave/50 border-b border-linea/70 flex items-center justify-between text-[11px] font-bold text-olivo">
                <span>Beneficiarios encontrados ({searchResults.length})</span>
                {isSearching && (
                  <span className="text-guinda flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-guinda animate-ping" />
                    Buscando...
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-linea/60">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 6).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBeneficiario(b.id, b.dni)}
                      className="w-full text-left p-3 hover:bg-suave/60 transition flex flex-col gap-1 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-carbon group-hover:text-guinda transition-colors truncate">
                          {b.nombre}
                        </span>
                        <span className="font-mono text-[11px] font-semibold bg-suave px-1.5 py-0.5 rounded border border-linea text-carbon shrink-0">
                          {b.dni}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-olivo">
                        <span className="truncate max-w-[180px]">
                          {b.expediente ? `Exp: ${b.expediente}` : b.juzgado || "Padrón judicial"}
                        </span>
                        {b.seguimiento && (
                          <span className="capitalize font-semibold text-[10px]">
                            {b.seguimiento === "en_curso"
                              ? "En curso"
                              : b.seguimiento === "alerta"
                              ? "En alerta"
                              : b.seguimiento === "cumple"
                              ? "Cumple"
                              : b.seguimiento}
                          </span>
                        )}
                      </div>

                      {b.hito && (
                        <div className="text-[10px] text-olivo/80 flex items-center justify-between pt-0.5">
                          <span className="truncate">{b.hito.titulo}</span>
                          <span className="font-bold text-guinda">
                            {b.hito.asistencias}/{b.hito.sesiones_requeridas} ({b.hito.progreso}%)
                          </span>
                        </div>
                      )}
                    </button>
                  ))
                ) : !isSearching ? (
                  <div className="p-4 text-center text-xs text-olivo">
                    No se encontraron beneficiarios con &ldquo;{debouncedQuery}&rdquo;
                  </div>
                ) : null}
              </div>

              {/* View all in beneficiarios page */}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full py-2.5 px-3 bg-[#faf9f6] hover:bg-suave text-guinda font-bold text-xs flex items-center justify-center gap-1.5 border-t border-linea/70 transition"
              >
                <span>Ver todos los resultados en Beneficiarios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Botón Instalar PWA */}
        {isInstallable && (
          <button
            type="button"
            onClick={promptInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-guinda text-white text-xs font-bold hover:bg-guinda/90 shadow-sm transition animate-in fade-in"
            title="Instalar Sistema de Asistencias en tu dispositivo"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span className="hidden md:inline">Instalar App</span>
          </button>
        )}

        {/* Real API connection indicator */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
            isApiOnline
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
          title={
            isApiOnline
              ? "Servicio backend respondiendo OK (/api/health)"
              : "Sin conexión al servicio backend (/api/health)"
          }
        >
          <Radio
            className={`w-3.5 h-3.5 ${
              isApiOnline
                ? "text-emerald-600 animate-pulse"
                : "text-rose-600"
            }`}
          />
          <span className="text-[11px]">
            {isApiOnline ? "API Conectada" : "API Desconectada"}
          </span>
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
          <div
            className="w-9 h-9 rounded-full bg-guinda text-white flex items-center justify-center font-bold text-xs shadow-xs"
            title={displayName}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
