import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Edit2, Eye, UserX } from "lucide-react";
import type { Beneficiario } from "../types/beneficiario.types";

interface BeneficiariosTableProps {
  beneficiarios: Beneficiario[];
  isLoading?: boolean;
  onEdit: (beneficiario: Beneficiario) => void;
  onViewDetails?: (beneficiario: Beneficiario) => void;
}

export function BeneficiariosTable({
  beneficiarios,
  isLoading,
  onEdit,
}: BeneficiariosTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-tile border border-linea p-12 text-center text-olivo">
        Cargando beneficiarios...
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
        <p className="text-xs text-olivo mt-1">
          Intenta cambiar los filtros de búsqueda o registra uno nuevo.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Beneficiario</TableHead>
          <TableHead>DNI</TableHead>
          <TableHead>Programa</TableHead>
          <TableHead>Contacto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {beneficiarios.map((b) => (
          <TableRow key={b.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-carbon">
                  {b.apellidos}, {b.nombres}
                </span>
                <span className="text-[11px] text-olivo">
                  ID: #{b.id} • Reg: {b.fechaRegistro || "2026-01-15"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono font-semibold text-carbon bg-suave/80 px-2 py-0.5 rounded-md text-xs">
                {b.dni}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-xs font-medium text-carbon">
                {b.programa}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex flex-col text-xs text-olivo">
                <span>{b.telefono || "Sin teléfono"}</span>
                <span className="text-[11px]">{b.correo || "Sin correo"}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  b.estado === "ACTIVO"
                    ? "success"
                    : b.estado === "SUSPENDIDO"
                    ? "warning"
                    : "danger"
                }
              >
                {b.estado}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(b)}
                  className="p-1.5 h-8 w-8"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5 text-olivo hover:text-guinda" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-8 w-8"
                  title="Ver Historial"
                >
                  <Eye className="w-3.5 h-3.5 text-olivo hover:text-carbon" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
