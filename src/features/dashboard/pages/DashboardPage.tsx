import { useState, useMemo } from "react";
import { StatsOverview } from "../components/StatsOverview";
import { MonitorInasistencias } from "../components/MonitorInasistencias";
import { FichaContactoModal } from "../components/FichaContactoModal";
import { QuickActions } from "../components/QuickActions";
import { JustificacionModal } from "@/features/justificaciones/components/JustificacionModal";
import { Button } from "@/components/ui";
import { RefreshCw, CheckCircle2, PhoneCall, ShieldAlert } from "lucide-react";
import { useGetSesionesQuery } from "@/features/asistencias/services/asistenciasApi";
import { useGetPersonasQuery } from "@/features/personas/services/personasApi";
import {
  useGetJustificacionesQuery,
  useRegistrarJustificacionMutation,
} from "@/features/justificaciones/services/justificacionesApi";
import { useGetHitosQuery } from "@/features/hitos/services/hitosApi";
import type {
  AlertaInasistencia,
  DashboardKPIS,
} from "../types/dashboard.types";
import type { RegistrarJustificacionPayload } from "@/features/justificaciones/types/justificacion.types";
import type { Persona } from "@/features/personas/types/persona.types";
import type { Justificacion } from "@/features/justificaciones/types/justificacion.types";

export function DashboardPage() {
  const [selectedAlertaForFicha, setSelectedAlertaForFicha] =
    useState<AlertaInasistencia | null>(null);

  const [selectedAlertaForJustificacion, setSelectedAlertaForJustificacion] =
    useState<AlertaInasistencia | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Consultas directas a las APIs reales
  const {
    data: sesiones = [],
    isLoading: isLoadingSesiones,
    isFetching: isFetchingSesiones,
    refetch: refetchSesiones,
  } = useGetSesionesQuery();

  const {
    data: personas = [],
    isLoading: isLoadingPersonas,
    isFetching: isFetchingPersonas,
    refetch: refetchPersonas,
  } = useGetPersonasQuery();

  const {
    data: justificaciones = [],
    refetch: refetchJustificaciones,
  } = useGetJustificacionesQuery();

  const {
    refetch: refetchHitos,
  } = useGetHitosQuery();

  const [registrarJustificacion, { isLoading: isRegisteringJust }] =
    useRegistrarJustificacionMutation();

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleRefreshAll = () => {
    refetchSesiones();
    refetchPersonas();
    refetchJustificaciones();
    refetchHitos();
    showNotification("Datos del Panel de Control sincronizados con el servidor.");
  };

  // Mapeo indexado de personas por ID y DNI para enriquecer las sesiones
  const personasMapById = useMemo(() => {
    const map = new Map<number, Persona>();
    personas.forEach((p) => map.set(p.id, p));
    return map;
  }, [personas]);

  const personasMapByDni = useMemo(() => {
    const map = new Map<string, Persona>();
    personas.forEach((p) => {
      if (p.dni) map.set(p.dni.trim(), p);
    });
    return map;
  }, [personas]);

  // Mapeo indexado de justificaciones por sesion_id o fecha
  const justificacionesMap = useMemo(() => {
    const map = new Map<string, Justificacion>();
    justificaciones.forEach((j) => {
      if (j.sesion_id) map.set(`sesion-${j.sesion_id}`, j);
      if (j.fecha) map.set(`fecha-${j.fecha}`, j);
    });
    return map;
  }, [justificaciones]);

  // Generación de alertas de Inasistencias y Tardanzas con datos de contacto
  const alertasInasistencias = useMemo<AlertaInasistencia[]>(() => {
    const items: AlertaInasistencia[] = [];

    sesiones.forEach((sesion) => {
      const rawEstado = (sesion.estado || "").toUpperCase();
      const isFalta =
        rawEstado.includes("FALTA") ||
        rawEstado.includes("AUSENTE") ||
        rawEstado.includes("INASISTENCIA");
      const isTardanza = rawEstado.includes("TARDANZA");

      if (isFalta || isTardanza) {
        const tipo: "FALTA" | "TARDANZA" = isFalta ? "FALTA" : "TARDANZA";

        // Buscar persona vinculada para obtener teléfono, expediente y juzgado
        let persona: Persona | undefined;
        if (sesion.persona_id) {
          persona = personasMapById.get(sesion.persona_id);
        }
        if (!persona && sesion.beneficiarioDni) {
          persona = personasMapByDni.get(sesion.beneficiarioDni.trim());
        }

        // Buscar si tiene justificación
        const just =
          (sesion.id ? justificacionesMap.get(`sesion-${sesion.id}`) : undefined) ||
          justificacionesMap.get(`fecha-${sesion.fecha}`);

        let estadoJustificacion: AlertaInasistencia["estadoJustificacion"] =
          "SIN_JUSTIFICAR";

        if (just) {
          const jEstado = (just.estado || "").toUpperCase();
          if (jEstado.includes("APROBADA") || jEstado.includes("APROBADO")) {
            estadoJustificacion = "JUSTIFICADA";
          } else {
            estadoJustificacion = "PENDIENTE";
          }
        }

        items.push({
          id: sesion.id || `sesion-${Math.random()}`,
          sesionId: sesion.id,
          personaId: sesion.persona_id || persona?.id,
          nombre:
            persona?.nombre ||
            sesion.beneficiarioNombre ||
            `Beneficiario #${sesion.persona_id || sesion.id}`,
          dni: persona?.dni || sesion.beneficiarioDni || "—",
          telefono: persona?.telefono || null,
          email: persona?.email || null,
          expediente: persona?.expediente || null,
          juzgado: persona?.juzgado || null,
          seguimiento: persona?.seguimiento || null,
          tipo,
          fecha: sesion.fecha,
          hora: sesion.hora,
          hitoNombre:
            sesion.hitoNombre ||
            (sesion.hito_id ? `Hito #${sesion.hito_id}` : "Sesión de Control"),
          estadoJustificacion,
          justificacionId: just?.id,
          personaCompleta: persona,
          sesionOriginal: sesion,
          justificacionOriginal: just,
        });
      }
    });

    // Ordenar de más reciente a más antiguo
    return items.sort((a, b) => (b.fecha > a.fecha ? 1 : -1));
  }, [sesiones, personasMapById, personasMapByDni, justificacionesMap]);

  // Cálculo de KPIs en tiempo real
  const kpis = useMemo<DashboardKPIS>(() => {
    const totalFaltas = alertasInasistencias.filter(
      (a) => a.tipo === "FALTA"
    ).length;
    const totalTardanzas = alertasInasistencias.filter(
      (a) => a.tipo === "TARDANZA"
    ).length;

    const justificacionesPendientes = justificaciones.filter(
      (j) => (j.estado || "PENDIENTE").toUpperCase() === "PENDIENTE"
    ).length;

    const totalBeneficiarios = personas.length;
    const totalSesiones = sesiones.length;
    const presentes = sesiones.filter(
      (s) => (s.estado || "").toUpperCase() === "PRESENTE"
    ).length;

    const asistenciaTasa =
      totalSesiones > 0
        ? Math.round((presentes / totalSesiones) * 100)
        : 100;

    return {
      totalFaltas,
      totalTardanzas,
      justificacionesPendientes,
      totalBeneficiarios,
      asistenciaTasa,
    };
  }, [alertasInasistencias, justificaciones, personas, sesiones]);

  const handleOpenJustificacion = (alerta: AlertaInasistencia) => {
    setSelectedAlertaForJustificacion(alerta);
  };

  const handleSaveJustificacionDirecta = async (
    payload: RegistrarJustificacionPayload
  ) => {
    await registrarJustificacion({
      ...payload,
      sesion_id: selectedAlertaForJustificacion?.sesionId || payload.sesion_id,
    }).unwrap();

    showNotification(
      `Justificación registrada exitosamente para ${selectedAlertaForJustificacion?.nombre}.`
    );
  };

  const isBusy =
    isLoadingSesiones ||
    isLoadingPersonas ||
    isFetchingSesiones ||
    isFetchingPersonas;

  return (
    <div className="space-y-6">
      {/* Notificación Toast */}
      {notification && (
        <div className="p-4 rounded-tile bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Banner de Bienvenida y Acciones de Control */}
      <div className="bg-white p-5 rounded-tile border border-linea/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-guinda text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-carbon tracking-tight">
              Centro de Control y Monitoreo de Asistencia
            </h2>
          </div>
          <p className="text-xs text-olivo">
            Seguimiento prioritario de beneficiarios con faltas y tardanzas para contacto telefónico y regularización judicial.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            isLoading={isBusy}
            leftIcon={<RefreshCw className="w-4 h-4 text-olivo" />}
            title="Sincronizar asistencias y padrón"
          >
            Actualizar Datos
          </Button>
        </div>
      </div>

      {/* Alerta Destacada si hay Faltas */}
      {kpis.totalFaltas > 0 && (
        <div className="p-4 rounded-tile bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-950">
                Atención Operativa: {kpis.totalFaltas} inasistencia(s) registrada(s) sin regularizar
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Utiliza los botones de WhatsApp o Llamada para contactar a los beneficiarios antes de reportar a sus juzgados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Operativos */}
      <StatsOverview kpis={kpis} isLoading={isLoadingSesiones} />

      {/* MONITOR PRINCIPAL: Inasistencias y Tardanzas con Nombre y Teléfono */}
      <MonitorInasistencias
        alertas={alertasInasistencias}
        isLoading={isLoadingSesiones}
        onOpenFicha={(alerta) => setSelectedAlertaForFicha(alerta)}
        onRegistrarJustificacion={handleOpenJustificacion}
      />

      {/* Acciones Rápidas Complementarias */}
      <QuickActions />

      {/* Modal Ficha Completa y Contacto Directo */}
      <FichaContactoModal
        isOpen={Boolean(selectedAlertaForFicha)}
        onClose={() => setSelectedAlertaForFicha(null)}
        alerta={selectedAlertaForFicha}
        onRegistrarJustificacion={handleOpenJustificacion}
      />

      {/* Modal Registrar Justificación Directa desde el Monitor */}
      <JustificacionModal
        isOpen={Boolean(selectedAlertaForJustificacion)}
        onClose={() => setSelectedAlertaForJustificacion(null)}
        onSave={handleSaveJustificacionDirecta}
        isLoading={isRegisteringJust}
      />
    </div>
  );
}

export default DashboardPage;
