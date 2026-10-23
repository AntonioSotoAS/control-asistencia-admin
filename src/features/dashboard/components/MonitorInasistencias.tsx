import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from "@/components/ui";
import {
  AlertOctagon,
  Clock,
  Phone,
  MessageCircle,
  Search,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import type { AlertaInasistencia } from "../types/dashboard.types";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface MonitorInasistenciasProps {
  alertas: AlertaInasistencia[];
  isLoading?: boolean;
  onOpenFicha: (alerta: AlertaInasistencia) => void;
  onRegistrarJustificacion: (alerta: AlertaInasistencia) => void;
}

export function MonitorInasistencias({
  alertas,
  isLoading,
  onOpenFicha,
  onRegistrarJustificacion,
}: MonitorInasistenciasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<
    "TODOS" | "FALTA" | "TARDANZA" | "SIN_JUSTIFICAR"
  >("TODOS");

  const debouncedSearch = useDebounce(searchTerm, 250);

  // Filtrado reactivo por término y por pestaña
  const filteredAlertas = useMemo(() => {
    return alertas.filter((item) => {
      // Filtro por tipo
      if (filterTipo === "FALTA" && item.tipo !== "FALTA") return false;
      if (filterTipo === "TARDANZA" && item.tipo !== "TARDANZA") return false;
      if (
        filterTipo === "SIN_JUSTIFICAR" &&
        item.estadoJustificacion !== "SIN_JUSTIFICAR"
      ) {
        return false;
      }

      // Filtro por búsqueda
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.toLowerCase().trim();
        const matchNombre = item.nombre.toLowerCase().includes(term);
        const matchDni = item.dni.includes(term);
        const matchTelefono = item.telefono?.includes(term) ?? false;
        const matchExpediente =
          item.expediente?.toLowerCase().includes(term) ?? false;
        const matchHito = item.hitoNombre.toLowerCase().includes(term);

        return (
          matchNombre ||
          matchDni ||
          matchTelefono ||
          matchExpediente ||
          matchHito
        );
      }

      return true;
    });
  }, [alertas, filterTipo, debouncedSearch]);

  const totalFaltas = useMemo(
    () => alertas.filter((a) => a.tipo === "FALTA").length,
    [alertas]
  );
  const totalTardanzas = useMemo(
    () => alertas.filter((a) => a.tipo === "TARDANZA").length,
    [alertas]
  );
  const totalSinJustificar = useMemo(
    () => alertas.filter((a) => a.estadoJustificacion === "SIN_JUSTIFICAR").length,
    [alertas]
  );

  return (
    <div className="bg-white rounded-tile border border-linea/80 shadow-xs overflow-hidden">
      {/* Cabecera del Monitor */}
      <div className="p-5 border-b border-linea/70 bg-[#fdfdfc] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-carbon tracking-tight">
              Monitor de Inasistencias y Tardanzas Recientes
            </h3>
          </div>
          <p className="text-xs text-olivo pl-10">
            Beneficiarios ausentes o con retraso para contacto telefónico directo y seguimiento legal.
          </p>
        </div>

        {/* Buscador reactivo */}
        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <Search className="w-4 h-4 text-olivo/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, DNI, teléfono o exp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold bg-suave/80 border border-linea rounded-field pl-10 pr-4 py-2.5 text-carbon placeholder:text-carbon/40 focus:outline-none focus:border-guinda focus:bg-white transition"
          />
        </div>
      </div>

      {/* Pestañas de Filtrado */}
      <div className="px-5 py-3 border-b border-linea/60 bg-suave/30 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterTipo("TODOS")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterTipo === "TODOS"
            ? "bg-carbon text-white shadow-xs"
            : "bg-white text-olivo hover:text-carbon border border-linea/80"
            }`}
        >
          Todos en Alerta ({alertas.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTipo("FALTA")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterTipo === "FALTA"
            ? "bg-rose-700 text-white shadow-xs"
            : "bg-white text-rose-800 hover:bg-rose-50 border border-rose-200"
            }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          Faltas ({totalFaltas})
        </button>

        <button
          type="button"
          onClick={() => setFilterTipo("TARDANZA")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterTipo === "TARDANZA"
            ? "bg-amber-600 text-white shadow-xs"
            : "bg-white text-amber-800 hover:bg-amber-50 border border-amber-200"
            }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Tardanzas ({totalTardanzas})
        </button>

        <button
          type="button"
          onClick={() => setFilterTipo("SIN_JUSTIFICAR")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterTipo === "SIN_JUSTIFICAR"
            ? "bg-guinda text-white shadow-xs"
            : "bg-white text-olivo hover:text-carbon border border-linea/80"
            }`}
        >
          Sin Justificar ({totalSinJustificar})
        </button>
      </div>

      {/* Contenido Tabla / Estado */}
      {isLoading ? (
        <div className="p-16 text-center text-olivo text-xs font-semibold">
          Actualizando padrón de asistencias y contactos...
        </div>
      ) : filteredAlertas.length === 0 ? (
        <div className="p-16 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-2" />
          <h4 className="text-base font-bold text-carbon">
            Sin inasistencias ni tardanzas pendientes de contacto
          </h4>
          <p className="text-xs text-olivo max-w-md mx-auto">
            {searchTerm
              ? "No se encontraron registros que coincidan con la búsqueda actual."
              : "¡Excelente! Todos los beneficiarios han asistido puntualmente a sus sesiones programadas."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiario</TableHead>
              <TableHead>Incidente / Tipo</TableHead>
              <TableHead>Fecha y Sesión</TableHead>
              <TableHead>Teléfono / Contacto</TableHead>
              <TableHead>Expediente / Juzgado</TableHead>
              <TableHead>Justificación</TableHead>
              <TableHead className="text-right">Acción Rápida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlertas.map((item) => {
              const cleanPhone = item.telefono
                ? item.telefono.replace(/\D/g, "")
                : "";
              const whatsappUrl = cleanPhone
                ? `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(
                  `Estimado(a) ${item.nombre}, le escribimos del Control de Asistencia respecto a su ${item.tipo === "FALTA" ? "inasistencia" : "tardanza"
                  } del ${item.fecha}. Por favor comunicarse para coordinar su regularización.`
                )}`
                : null;

              return (
                <TableRow key={item.id} className="hover:bg-suave/40">
                  {/* Beneficiario */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-sm text-carbon block">
                        {item.nombre}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-olivo bg-suave px-2 py-0.5 rounded border border-linea/60">
                        DNI: {item.dni}
                      </span>
                    </div>
                  </TableCell>

                  {/* Tipo */}
                  <TableCell>
                    {item.tipo === "FALTA" ? (
                      <Badge variant="danger" className="gap-1 font-extrabold">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        FALTA
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1 font-extrabold">
                        <Clock className="w-3.5 h-3.5" />
                        TARDANZA
                      </Badge>
                    )}
                  </TableCell>

                  {/* Fecha y Hito */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-carbon block">
                        {item.fecha}
                      </span>
                      <span className="text-[11px] text-olivo truncate max-w-[170px] block">
                        {item.hitoNombre}
                      </span>
                    </div>
                  </TableCell>

                  {/* Teléfono / WhatsApp Directo */}
                  <TableCell>
                    {cleanPhone ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="inline-flex items-center gap-1 font-mono font-bold text-xs text-carbon hover:text-guinda bg-suave/80 px-2 py-1 rounded border border-linea/60"
                          title="Llamar teléfono"
                        >
                          <Phone className="w-3 h-3 text-guinda shrink-0" />
                          {item.telefono}
                        </a>

                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                            title="Escribir por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-olivo/70 italic">
                        Sin teléfono
                      </span>
                    )}
                  </TableCell>

                  {/* Expediente Judicial */}
                  <TableCell className="max-w-[180px]">
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-bold text-carbon block truncate">
                        {item.expediente || "Sin expediente"}
                      </span>
                      <span className="text-[11px] text-olivo block truncate">
                        {item.juzgado || "S/D"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Justificación */}
                  <TableCell>
                    {item.estadoJustificacion === "JUSTIFICADA" ? (
                      <Badge variant="success">Justificada</Badge>
                    ) : item.estadoJustificacion === "PENDIENTE" ? (
                      <Badge variant="warning">En trámite</Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRegistrarJustificacion(item)}
                        className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition cursor-pointer hover:underline"
                        title="Haz clic para registrar justificación de esta inasistencia"
                      >
                        Sin Justificar +
                      </button>
                    )}
                  </TableCell>

                  {/* Acción rápida */}
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenFicha(item)}
                      leftIcon={<UserCheck className="w-3.5 h-3.5 text-guinda" />}
                      className="text-xs"
                    >
                      Ficha
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
