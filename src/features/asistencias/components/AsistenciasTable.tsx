import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/ui";
import { CalendarCheck, CalendarClock, Upload } from "lucide-react";
import type { Asistencia } from "../types/asistencia.types";

interface AsistenciasTableProps {
  asistencias: Asistencia[];
  isLoading?: boolean;
  onMarcarSesion?: (sesion: Asistencia) => void;
  onEditarFecha?: (sesion: Asistencia) => void;
}

export function AsistenciasTable({
  asistencias,
  isLoading,
  onMarcarSesion,
  onEditarFecha,
}: AsistenciasTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo">
        Cargando registro de asistencias...
      </div>
    );
  }

  if (asistencias.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center">
        <CalendarCheck className="w-12 h-12 text-olivo/40 mx-auto mb-3" />
        <h4 className="text-base font-bold text-carbon">
          No hay marcaciones de asistencia encontradas
        </h4>
        <p className="text-xs text-olivo mt-1">
          Utiliza el botón de marcar asistencia o selecciona otro filtro.
        </p>
      </div>
    );
  }


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16"># Sesión</TableHead>
          <TableHead>Beneficiario</TableHead>
          <TableHead>Hito de Control</TableHead>
          <TableHead>Fecha y Tipo</TableHead>
          <TableHead>Comprobante / Notas</TableHead>
          <TableHead className="w-24">¿Asistió?</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {asistencias.map((item) => {
          const asistio = item.asistio ?? (item.estado === "PRESENTE" || item.estado === "ASISTIO");

          return (
            <TableRow key={item.id} className="hover:bg-suave/40">
              {/* # Sesión */}
              <TableCell>
                <span className="w-7 h-7 rounded-full bg-suave flex items-center justify-center font-mono font-bold text-xs text-carbon border border-linea/60">
                  #{item.numero || item.id}
                </span>
              </TableCell>

              {/* Beneficiario */}
              <TableCell>
                <div className="space-y-0.5">
                  <span className="font-extrabold text-sm text-carbon block">
                    {item.beneficiarioNombre}
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-olivo bg-suave px-1.5 py-0.5 rounded border border-linea/60">
                    DNI: {item.beneficiarioDni}
                  </span>
                </div>
              </TableCell>

              {/* Hito */}
              <TableCell>
                <span className="text-xs font-semibold text-carbon">
                  {item.hitoNombre || `Hito #${item.hito_id || "—"}`}
                </span>
              </TableCell>

              {/* Fecha y Tipo */}
              <TableCell>
                <div className="flex flex-col text-xs">
                  <span className="font-bold text-carbon">{item.fecha}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {item.hora && item.hora !== "—" && (
                      <span className="text-[11px] text-olivo">{item.hora}</span>
                    )}
                    {item.tipo && (
                      <span className="text-[10px] uppercase font-bold text-olivo bg-suave/80 px-1 py-0.2 rounded border border-linea/60">
                        {item.tipo}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Comprobante / Notas */}
              <TableCell className="max-w-[220px]">
                <div className="space-y-1 text-xs">
                  {item.comprobante ? (
                    <div>
                      {item.comprobante_url ? (
                        <a
                          href={item.comprobante_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-guinda hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          📎 {item.comprobante}
                        </a>
                      ) : (
                        <span className="text-olivo font-mono text-[11px]">
                          📎 {item.comprobante}
                        </span>
                      )}
                    </div>
                  ) : null}

                  {item.notas || item.observacion ? (
                    <span className="text-[11px] text-carbon/80 italic block truncate">
                      "{item.notas || item.observacion}"
                    </span>
                  ) : null}

                  {!item.comprobante && !item.notas && !item.observacion && (
                    <span className="text-olivo/50 text-[11px]">—</span>
                  )}
                </div>
              </TableCell>

              {/* ¿Asistió? */}
              <TableCell>
                {asistio ? (
                  <Badge variant="success" className="gap-1 font-bold">
                    ✓ Asistió
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-olivo font-medium">
                    Programada
                  </Badge>
                )}
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {onEditarFecha && (
                    <button
                      type="button"
                      onClick={() => onEditarFecha(item)}
                      className="p-1.5 rounded-lg border border-linea hover:bg-suave text-olivo hover:text-carbon transition cursor-pointer"
                      title="Modificar fecha de la sesión (PUT /api/sesiones/{id}/fecha)"
                    >
                      <CalendarClock className="w-4 h-4 text-olivo" />
                    </button>
                  )}
                  {onMarcarSesion && (
                    <button
                      type="button"
                      onClick={() => onMarcarSesion(item)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#562599]/30 bg-[#562599]/5 hover:bg-[#562599] text-[#562599] hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Registrar marcación y subir comprobante/prueba (POST /api/sesiones)"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{item.comprobante ? "Actualizar Prueba" : "Subir Prueba"}</span>
                    </button>
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
