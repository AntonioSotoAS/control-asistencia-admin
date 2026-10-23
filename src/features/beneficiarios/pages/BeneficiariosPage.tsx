import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import { BeneficiarioFilter } from "../components/BeneficiarioFilter";
import { BeneficiariosTable } from "../components/BeneficiariosTable";
import { BeneficiarioDetalleModal } from "../components/BeneficiarioDetalleModal";
import { useGetBeneficiariosQuery } from "../services/beneficiariosApi";
import type { Beneficiario } from "../types/beneficiario.types";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const fallbackBeneficiarios: Beneficiario[] = [
  {
    id: 1,
    nombre: "Ana García",
    dni: "45821376",
    email: "ana.garcia@example.com",
    telefono: "987412650",
    expediente: "00128-2025-0-2501-JR-FT-02",
    juzgado: "Segundo Juzgado de Familia Transitorio del Santa",
    seguimiento: "en_curso",
    consentimiento_aceptado: true,
    consentimiento_fecha: "2026-01-15T10:00:00Z",
    usuario: {
      id: 2,
      identificador: "45821376",
      rol: "beneficiario",
      estado: "activo",
    },
    hito: {
      id: 1,
      titulo: "Sesiones de Orientación y Control",
      fecha: "2026-03-30",
      sesiones_requeridas: 6,
      asistencias: 4,
      progreso: 67,
      completado: false,
      revision: null,
      estado: "activo",
    },
  },
  {
    id: 2,
    nombre: "Carlos Alberto Mendoza",
    dni: "41982314",
    email: "carlos.mendoza@gmail.com",
    telefono: "981234567",
    expediente: "00245-2025-0-2501-JR-FT-01",
    juzgado: "Primer Juzgado de Familia del Santa",
    seguimiento: "alerta",
    consentimiento_aceptado: true,
    consentimiento_fecha: "2026-01-20T11:30:00Z",
    usuario: {
      id: 3,
      identificador: "41982314",
      rol: "beneficiario",
      estado: "activo",
    },
    hito: {
      id: 2,
      titulo: "Terapia Reeducativa Familiar",
      fecha: "2026-03-15",
      sesiones_requeridas: 8,
      asistencias: 2,
      progreso: 25,
      completado: false,
      revision: "Alerta emitida por inasistencia en la 3ra fecha.",
      estado: "activo",
    },
  },
  {
    id: 3,
    nombre: "Rosa Elena Palacios",
    dni: "47291038",
    email: "rosa.palacios@outlook.com",
    telefono: "993821049",
    expediente: "00312-2025-0-2501-JR-FT-03",
    juzgado: "Tercer Juzgado de Familia Subespecializado",
    seguimiento: "cumple",
    consentimiento_aceptado: true,
    consentimiento_fecha: "2026-02-01T09:00:00Z",
    usuario: {
      id: 4,
      identificador: "47291038",
      rol: "beneficiario",
      estado: "activo",
    },
    hito: {
      id: 3,
      titulo: "Programa de Atención Psicológica",
      fecha: "2026-04-10",
      sesiones_requeridas: 5,
      asistencias: 5,
      progreso: 100,
      completado: true,
      revision: "Hito cumplido satisfactoriamente.",
      estado: "activo",
    },
  },
  {
    id: 4,
    nombre: "Luis Fernando Quispe",
    dni: "43928172",
    email: null,
    telefono: "965412398",
    expediente: "00409-2025-0-2501-JR-FT-02",
    juzgado: "Segundo Juzgado de Familia Transitorio del Santa",
    seguimiento: "incumplimiento",
    consentimiento_aceptado: false,
    usuario: {
      id: 5,
      identificador: "43928172",
      rol: "beneficiario",
      estado: "inactivo",
    },
    hito: {
      id: 4,
      titulo: "Hito de Verificación Judicial",
      fecha: "2026-02-28",
      sesiones_requeridas: 6,
      asistencias: 1,
      progreso: 17,
      completado: false,
      revision: "Informe de incumplimiento remitido al juzgado.",
      estado: "activo",
    },
  },
];

export function BeneficiariosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialId = searchParams.get("id");

  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const [seguimientoFilter, setSeguimientoFilter] = useState("TODOS");
  const [estadoFilter, setEstadoFilter] = useState("TODOS");

  const [selectedBeneficiario, setSelectedBeneficiario] =
    useState<Beneficiario | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) {
        setSearchParams({ q: searchTerm }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, setSearchParams]);

  const {
    data: apiData,
    isLoading,
    isFetching,
    refetch,
  } = useGetBeneficiariosQuery({
    q: debouncedSearch,
    seguimiento: seguimientoFilter,
    estado: estadoFilter,
  });

  // Fallback data when API has no entries or during disconnected development
  const beneficiariesList: Beneficiario[] = useMemo(() => {
    if (apiData && apiData.length > 0) {
      return apiData;
    }

    if (apiData && apiData.length === 0 && (debouncedSearch || seguimientoFilter !== "TODOS" || estadoFilter !== "TODOS")) {
      return [];
    }

    // Filter fallback list locally for responsive fallback
    return fallbackBeneficiarios.filter((b) => {
      const matchQ =
        !debouncedSearch.trim() ||
        b.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        b.dni.includes(debouncedSearch) ||
        (b.expediente || "").toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchSeguimiento =
        seguimientoFilter === "TODOS" || b.seguimiento === seguimientoFilter;

      const matchEstado =
        estadoFilter === "TODOS" || b.usuario?.estado === estadoFilter;

      return matchQ && matchSeguimiento && matchEstado;
    });
  }, [apiData, debouncedSearch, seguimientoFilter, estadoFilter]);

  // If navigated with ?id=..., open modal automatically
  useEffect(() => {
    if (initialId && beneficiariesList.length > 0) {
      const target = beneficiariesList.find((b) => String(b.id) === initialId);
      if (target) {
        setSelectedBeneficiario(target);
      }
    }
  }, [initialId, beneficiariesList]);

  // Quick KPI calculation
  const stats = useMemo(() => {
    const total = beneficiariesList.length;
    const enCurso = beneficiariesList.filter(
      (b) => b.seguimiento === "en_curso"
    ).length;
    const alertas = beneficiariesList.filter(
      (b) => b.seguimiento === "alerta" || b.seguimiento === "incumplimiento"
    ).length;
    const cumplen = beneficiariesList.filter(
      (b) => b.seguimiento === "cumple" || b.seguimiento === "culminado"
    ).length;

    return { total, enCurso, alertas, cumplen };
  }, [beneficiariesList]);

  return (
    <div className="space-y-6">
      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-guinda/10 text-guinda flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-olivo uppercase block leading-tight">
              Padrón General
            </span>
            <span className="text-xl font-black text-carbon tracking-tight">
              {stats.total}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-olivo uppercase block leading-tight">
              En Curso
            </span>
            <span className="text-xl font-black text-sky-950 tracking-tight">
              {stats.enCurso}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-olivo uppercase block leading-tight">
              En Alerta / Falta
            </span>
            <span className="text-xl font-black text-amber-950 tracking-tight">
              {stats.alertas}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-tile border border-linea/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-olivo uppercase block leading-tight">
              Cumplen / Culminan
            </span>
            <span className="text-xl font-black text-emerald-950 tracking-tight">
              {stats.cumplen}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <BeneficiarioFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        seguimientoFilter={seguimientoFilter}
        onSeguimientoFilterChange={setSeguimientoFilter}
        estadoFilter={estadoFilter}
        onEstadoFilterChange={setEstadoFilter}
        onRefresh={refetch}
        isLoading={isLoading || isFetching}
        totalCount={beneficiariesList.length}
      />

      {/* Beneficiarios Data Table */}
      <BeneficiariosTable
        beneficiarios={beneficiariesList}
        isLoading={isLoading}
        onViewDetails={(b) => setSelectedBeneficiario(b)}
      />

      {/* Detalle Integral Modal */}
      <BeneficiarioDetalleModal
        isOpen={Boolean(selectedBeneficiario)}
        onClose={() => setSelectedBeneficiario(null)}
        beneficiario={selectedBeneficiario}
      />
    </div>
  );
}

export default BeneficiariosPage;
