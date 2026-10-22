import { useState, useMemo } from "react";
import { HitosList } from "../components/HitosList";
import { AgendarFechasModal } from "../components/AgendarFechasModal";
import { RevisarHitoModal } from "../components/RevisarHitoModal";
import { Button } from "@/components/ui";
import { CalendarPlus, Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  useGetHitosQuery,
  useAgendarFechasHitoMutation,
  useRevisarFechasHitoMutation,
} from "../services/hitosApi";
import type {
  HitoAvance,
  AgendarFechasHitoPayload,
  RevisarFechasHitoPayload,
} from "../types/hito.types";

export function HitosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isAgendarOpen, setIsAgendarOpen] = useState(false);
  const [selectedHitoForAgendar, setSelectedHitoForAgendar] =
    useState<HitoAvance | null>(null);

  const [isRevisarOpen, setIsRevisarOpen] = useState(false);
  const [selectedHitoForRevisar, setSelectedHitoForRevisar] =
    useState<HitoAvance | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Consulta directa a la API GET /api/hitos (Fecha hito y avance de asistencias)
  const {
    data: hitos = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetHitosQuery();

  const [agendarFechas, { isLoading: isAgendando }] =
    useAgendarFechasHitoMutation();

  const [revisarFechas, { isLoading: isRevisando }] =
    useRevisarFechasHitoMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const filteredHitos = useMemo(() => {
    if (!debouncedSearch.trim()) return hitos;
    const term = debouncedSearch.toLowerCase().trim();
    return hitos.filter((h) => {
      const matchNombre = h.nombre?.toLowerCase().includes(term) ?? false;
      const matchFecha =
        (h.fecha_hito?.includes(term) || h.fecha?.includes(term)) ?? false;
      const matchPersona =
        h.persona?.nombre?.toLowerCase().includes(term) ||
        h.persona?.dni?.includes(term);

      return matchNombre || matchFecha || matchPersona;
    });
  }, [hitos, debouncedSearch]);

  const handleOpenAgendarGlobal = () => {
    setSelectedHitoForAgendar(hitos[0] || null);
    setIsAgendarOpen(true);
  };

  const handleOpenAgendarHito = (hito: HitoAvance) => {
    setSelectedHitoForAgendar(hito);
    setIsAgendarOpen(true);
  };

  const handleOpenRevisarHito = (hito: HitoAvance) => {
    setSelectedHitoForRevisar(hito);
    setIsRevisarOpen(true);
  };

  const handleSaveAgendarFechas = async (payload: AgendarFechasHitoPayload) => {
    await agendarFechas(payload).unwrap();
    showNotification("Fechas de sesiones agendadas exitosamente en el servidor (POST /api/hitos/fechas).");
  };

  const handleSaveRevisarHito = async (payload: RevisarFechasHitoPayload) => {
    await revisarFechas(payload).unwrap();
    showNotification("Dictamen de revisión de fechas guardado exitosamente (PUT /api/hitos/{id}/revision).");
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabecera y Barra de Filtros */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-5 rounded-tile border border-linea/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-carbon tracking-tight">
            Gestión de Hitos y Avance de Asistencias
          </h2>
          <p className="text-xs text-olivo mt-0.5">
            Monitoreo de metas, programación de sesiones y revisión de validez de fechas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por hito, fecha o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold bg-suave/70 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              isLoading={isFetching && !isLoading}
              className="px-3"
              title="Refrescar hitos desde el servidor"
            >
              <RefreshCw className="w-4 h-4 text-olivo" />
            </Button>

            <Button
              variant="primary"
              onClick={handleOpenAgendarGlobal}
              leftIcon={<CalendarPlus className="w-4 h-4" />}
              className="font-bold shrink-0"
            >
              Agendar Fechas
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Hitos con Avance Real */}
      <HitosList
        hitos={filteredHitos}
        isLoading={isLoading}
        onAgendarFechas={handleOpenAgendarHito}
        onRevisar={handleOpenRevisarHito}
      />

      {/* Modal para POST /api/hitos/fechas */}
      <AgendarFechasModal
        isOpen={isAgendarOpen}
        onClose={() => {
          setIsAgendarOpen(false);
          setSelectedHitoForAgendar(null);
        }}
        hito={selectedHitoForAgendar}
        onAgendar={handleSaveAgendarFechas}
        isLoading={isAgendando}
      />

      {/* Modal para PUT /api/hitos/{id}/revision */}
      <RevisarHitoModal
        isOpen={isRevisarOpen}
        onClose={() => {
          setIsRevisarOpen(false);
          setSelectedHitoForRevisar(null);
        }}
        hito={selectedHitoForRevisar}
        onRevisar={handleSaveRevisarHito}
        isLoading={isRevisando}
      />
    </div>
  );
}

export default HitosPage;
