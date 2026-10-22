import { useNavigate } from "react-router";
import { Button, Card } from "@/components/ui";
import { QrCode, UserPlus, FileSpreadsheet, Flag } from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card className="p-4 sm:p-5 bg-gradient-to-r from-white via-white to-suave/40">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-extrabold text-carbon tracking-tight">
            Acciones Rápidas
          </h4>
          <p className="text-xs text-olivo mt-0.5">
            Operaciones frecuentes de control y registro
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/asistencias")}
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            Registrar Asistencia
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/beneficiarios")}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Nuevo Beneficiario
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/hitos")}
            leftIcon={<Flag className="w-4 h-4" />}
          >
            Nuevo Hito
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/reportes")}
            leftIcon={<FileSpreadsheet className="w-4 h-4" />}
          >
            Reporte Consolidado
          </Button>
        </div>
      </div>
    </Card>
  );
}
