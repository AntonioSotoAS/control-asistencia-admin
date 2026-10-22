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
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  CalendarPlus,
  ShieldCheck,
  Building2,
  Loader2,
  Flag,
  CalendarX2,
} from "lucide-react";
import type { HitoAdmin } from "../types/hito.types";

interface HitosAdminTableProps {
  hitos: HitoAdmin[];
  isLoading?: boolean;
  onViewDetail: (hito: HitoAdmin) => void;
  onAgendarFechas: (hito: HitoAdmin) => void;
  onRevisar: (hito: HitoAdmin) => void;
  onRetry?: () => void;
}

export function HitosAdminTable({
  hitos,
  isLoading,
  onViewDetail,
  onAgendarFechas,
  onRevisar,
  onRetry,
}: HitosAdminTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 flex flex-col items-center justify-center gap-3 text-olivo">
        <Loader2 className="w-8 h-8 animate-spin text-guinda" />
        <p className="text-sm font-semibold text-carbon">
          Consultando hitos de todos los usuarios en el servidor (/api/admin/hitos)...
        </p>
      </div>
    );
  }

  if (hitos.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-16 text-center space-y-3">
        <Flag className="w-12 h-12 text-olivo/40 mx-auto" />
        <h4 className="text-base font-bold text-carbon">
          No se encontraron hitos con los filtros actuales
        </h4>
        <p className="text-xs text-olivo max-w-md mx-auto">
          Prueba cambiando el estado, tipo de revisión o la búsqueda de texto.
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Actualizar Lista
          </Button>
        )}
      </div>
    );
  }

  const getRevisionBadge = (revision?: string) => {
    switch (revision?.toLowerCase()) {
      case "valida":
        return (
          <Badge variant="success" className="gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Válida
          </Badge>
        );
      case "observada":
        return (
          <Badge variant="danger" className="gap-1 font-bold">
            <AlertTriangle className="w-3 h-3" />
            Observada
          </Badge>
        );
      case "pendiente":
      default:
        return (
          <Badge variant="warning" className="gap-1 font-bold">
            <Clock className="w-3 h-3" />
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Beneficiario</TableHead>
          <TableHead>Expediente / Juzgado</TableHead>
          <TableHead>Fecha Hito</TableHead>
          <TableHead className="w-44">Avance de Sesiones</TableHead>
          <TableHead>Revisión</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {hitos.map((item, index) => {
          const persona = item.persona;
          const hasHito = item.tiene_hito ?? Boolean(item.id);
          const total = item.sesiones_totales || item.sesiones_count || (hasHito ? 1 : 0);
          const asistidas = item.sesiones_completadas || item.asistencias_count || 0;
          const porcentaje = item.porcentaje_avance ?? 0;

          return (
            <TableRow key={item.id ?? `sin-hito-${item.persona_id}-${index}`} className="hover:bg-suave/40">
              {/* Beneficiario */}
              <TableCell>
                <div className="space-y-0.5">
                  <span className="font-extrabold text-sm text-carbon block">
                    {persona?.nombre || item.nombre || `Beneficiario #${item.persona_id}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-olivo bg-suave px-2 py-0.5 rounded border border-linea/60">
                      DNI: {persona?.dni || "—"}
                    </span>
                    {persona?.telefono && (
                      <span className="text-[11px] text-olivo">
                        Tel: {persona.telefono}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Expediente y Juzgado */}
              <TableCell className="max-w-[200px]">
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-carbon block truncate">
                    {persona?.expediente || "Sin expediente"}
                  </span>
                  <span className="text-[11px] text-olivo flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 shrink-0" />
                    {persona?.juzgado || "S/D"}
                  </span>
                </div>
              </TableCell>

              {/* Fecha Hito */}
              <TableCell>
                {hasHito ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-carbon">
                    <Calendar className="w-3.5 h-3.5 text-guinda shrink-0" />
                    <span>{item.fecha_hito || item.fecha || "Programado"}</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <CalendarX2 className="w-3 h-3" />
                    Sin fechas
                  </span>
                )}
              </TableCell>

              {/* Avance de Asistencias */}
              <TableCell>
                {hasHito ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-olivo">
                        {asistidas} de {total} sesiones
                      </span>
                      <span className="text-carbon font-extrabold">
                        {porcentaje}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-suave rounded-full overflow-hidden border border-linea/40">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          porcentaje >= 100
                            ? "bg-emerald-600"
                            : porcentaje >= 50
                            ? "bg-guinda"
                            : "bg-amber-600"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(porcentaje, 4))}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-olivo italic">
                    Pendiente agendar
                  </span>
                )}
              </TableCell>

              {/* Revisión */}
              <TableCell>
                {hasHito ? (
                  getRevisionBadge(item.revision)
                ) : (
                  <Badge variant="default">No aplica</Badge>
                )}
              </TableCell>

              {/* Estado */}
              <TableCell>
                <Badge
                  variant={
                    item.estado === "activo"
                      ? "success"
                      : item.estado === "cerrado"
                      ? "olivo"
                      : "default"
                  }
                  className="capitalize font-semibold"
                >
                  {item.estado || "activo"}
                </Badge>
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {/* Ver Detalle (GET /api/admin/hitos/{id}) */}
                  {item.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(item)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="p-1.5 h-8 text-xs text-olivo hover:text-guinda"
                      title="Ver detalle del hito y sus sesiones (GET /api/admin/hitos/{id})"
                    >
                      Detalle
                    </Button>
                  )}

                  {/* Agendar Fechas (POST /api/hitos/fechas) */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAgendarFechas(item)}
                    leftIcon={<CalendarPlus className="w-3.5 h-3.5 text-guinda" />}
                    className="text-xs font-semibold py-1 h-8"
                    title="Agendar o editar fechas de sesiones (POST /api/hitos/fechas)"
                  >
                    Agendar
                  </Button>

                  {/* Revisar Validez (PUT /api/hitos/{id}/revision) */}
                  {item.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevisar(item)}
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
                      className="p-1.5 h-8 text-xs text-olivo hover:text-carbon"
                      title="Revisar validez del hito para Juez / Admin (PUT /api/hitos/{id}/revision)"
                    >
                      Revisar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
