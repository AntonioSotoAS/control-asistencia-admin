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
  Eye,
  UserX,
  FileText,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Building2,
} from "lucide-react";
import type { Beneficiario, SeguimientoTipo } from "../types/beneficiario.types";

interface BeneficiariosTableProps {
  beneficiarios: Beneficiario[];
  isLoading?: boolean;
  onViewDetails: (beneficiario: Beneficiario) => void;
}

export function getSeguimientoBadge(seguimiento?: SeguimientoTipo | string | null) {
  switch (seguimiento) {
    case "cumple":
      return (
        <Badge variant="success" className="text-[11px] font-bold">
          <CheckCircle2 className="w-3 h-3 mr-1 inline" />
          Cumple
        </Badge>
      );
    case "alerta":
      return (
        <Badge variant="warning" className="text-[11px] font-bold">
          <AlertTriangle className="w-3 h-3 mr-1 inline" />
          En Alerta
        </Badge>
      );
    case "incumplimiento":
      return (
        <Badge variant="danger" className="text-[11px] font-bold">
          <XCircle className="w-3 h-3 mr-1 inline" />
          Incumplimiento
        </Badge>
      );
    case "culminado":
      return (
        <Badge variant="info" className="text-[11px] font-bold">
          <CheckCircle2 className="w-3 h-3 mr-1 inline" />
          Culminado
        </Badge>
      );
    case "en_curso":
    default:
      return (
        <Badge variant="info" className="text-[11px] font-bold">
          <Clock className="w-3 h-3 mr-1 inline" />
          En Curso
        </Badge>
      );
  }
}

export function BeneficiariosTable({
  beneficiarios,
  isLoading,
  onViewDetails,
}: BeneficiariosTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo space-y-3">
        <div className="w-8 h-8 border-2 border-guinda border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Cargando padrón de beneficiarios...</p>
      </div>
    );
  }

  if (beneficiarios.length === 0) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center">
        <UserX className="w-12 h-12 text-olivo/40 mx-auto mb-3" />
        <h4 className="text-base font-bold text-carbon">
          No se encontraron beneficiarios
        </h4>
        <p className="text-xs text-olivo mt-1 max-w-sm mx-auto">
          No hay beneficiarios que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-tile border border-linea/80 overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#faf9f6]">
            <TableHead className="font-extrabold text-carbon">Beneficiario / Causa</TableHead>
            <TableHead className="font-extrabold text-carbon">DNI</TableHead>
            <TableHead className="font-extrabold text-carbon">Seguimiento</TableHead>
            <TableHead className="font-extrabold text-carbon">Hito y Asistencias</TableHead>
            <TableHead className="font-extrabold text-carbon">Estado Cuenta</TableHead>
            <TableHead className="font-extrabold text-carbon">Contacto</TableHead>
            <TableHead className="text-right font-extrabold text-carbon">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beneficiarios.map((b) => {
            const hito = b.hito;
            const isActivo = b.usuario?.estado === "activo";

            return (
              <TableRow
                key={b.id}
                className="hover:bg-suave/40 transition-colors cursor-pointer"
                onClick={() => onViewDetails(b)}
              >
                {/* Beneficiario / Causa */}
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-carbon text-sm hover:text-guinda transition-colors">
                      {b.nombre}
                    </span>
                    {b.expediente ? (
                      <span className="text-[11px] text-olivo flex items-center gap-1 font-mono">
                        <FileText className="w-3 h-3 text-olivo/70 shrink-0" />
                        {b.expediente}
                      </span>
                    ) : (
                      <span className="text-[11px] text-olivo/60 italic">
                        Sin expediente registrado
                      </span>
                    )}
                    {b.juzgado && (
                      <span className="text-[10px] text-olivo/80 flex items-center gap-1 truncate max-w-xs">
                        <Building2 className="w-3 h-3 text-olivo/60 shrink-0" />
                        {b.juzgado}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* DNI */}
                <TableCell>
                  <span className="font-mono font-bold text-carbon bg-suave border border-linea px-2 py-0.5 rounded text-xs select-all">
                    {b.dni}
                  </span>
                </TableCell>

                {/* Seguimiento */}
                <TableCell>{getSeguimientoBadge(b.seguimiento)}</TableCell>

                {/* Hito Activo y Asistencias */}
                <TableCell>
                  {hito ? (
                    <div className="space-y-1 min-w-36 max-w-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-carbon truncate max-w-[140px]" title={hito.titulo}>
                          {hito.titulo}
                        </span>
                        <span className="font-mono font-bold text-guinda text-[11px] ml-1">
                          {hito.asistencias}/{hito.sesiones_requeridas}
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-full bg-suave rounded-full h-1.5 overflow-hidden border border-linea/60">
                        <div
                          className={`h-full rounded-full transition-all ${
                            hito.progreso >= 100
                              ? "bg-emerald-600"
                              : hito.progreso >= 50
                              ? "bg-guinda"
                              : "bg-amber-500"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(0, hito.progreso))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-olivo block">
                        Progreso: {hito.progreso}%
                        {hito.completado ? " • Cumplido" : ""}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-olivo/60 italic">
                      Sin hito asignado
                    </span>
                  )}
                </TableCell>

                {/* Estado Cuenta */}
                <TableCell>
                  <Badge variant={isActivo ? "success" : "danger"} className="text-[11px]">
                    {isActivo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>

                {/* Contacto */}
                <TableCell>
                  <div className="flex flex-col text-xs text-olivo gap-0.5">
                    {b.telefono ? (
                      <span className="font-semibold text-carbon flex items-center gap-1">
                        <Phone className="w-3 h-3 text-olivo/70" />
                        {b.telefono}
                      </span>
                    ) : (
                      <span className="text-[11px] text-olivo/60 italic">Sin teléfono</span>
                    )}
                    {b.email && (
                      <span className="text-[11px] truncate max-w-[130px]" title={b.email}>
                        {b.email}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(b)}
                      className="px-2.5 py-1 text-xs font-semibold text-carbon hover:text-guinda hover:bg-suave inline-flex items-center gap-1.5"
                      title="Ver Ficha Integral"
                    >
                      <Eye className="w-3.5 h-3.5 text-olivo" />
                      Ficha
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
