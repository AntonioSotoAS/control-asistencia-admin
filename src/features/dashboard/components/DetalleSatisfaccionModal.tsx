import { Modal, Button } from "@/components/ui";
import { Star, User, Calendar, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { useGetSatisfaccionListQuery } from "../services/satisfaccionApi";

interface DetalleSatisfaccionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DetalleSatisfaccionModal({
  isOpen,
  onClose,
}: DetalleSatisfaccionModalProps) {
  const { data, isLoading, refetch, isFetching } = useGetSatisfaccionListQuery(undefined, {
    skip: !isOpen,
  });

  if (!isOpen) return null;

  const personas = data?.personas || [];
  const promedio = data?.promedio;
  const total = data?.total || personas.length;

  const getNivelBadge = (nivel: number, etiqueta: string) => {
    switch (nivel) {
      case 5:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ★ 5 • {etiqueta || "Muy Satisfecho"}
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#562599] border border-purple-200">
            ★ 4 • {etiqueta || "Satisfecho"}
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            ★ 3 • {etiqueta || "Neutral"}
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
            ★ 2 • {etiqueta || "Insatisfecho"}
          </span>
        );
      case 1:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            ★ 1 • {etiqueta || "Muy Insatisfecho"}
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reporte Detallado de Satisfacción"
      description="Listado de evaluaciones y percepciones registradas por los beneficiarios en la app (/api/satisfaccion)."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-ink-secondary">
            {total} {total === 1 ? "evaluación registrada" : "evaluaciones registradas"}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Header Resumen */}
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#562599] text-white flex items-center justify-center font-black text-lg shadow-xs">
              <Star className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-ink-primary">
                  {promedio !== null && promedio !== undefined ? promedio.toFixed(1) : "—"}
                </span>
                <span className="text-xs text-ink-secondary font-bold">/ 5.0</span>
              </div>
              <p className="text-xs text-[#562599] font-semibold">
                Promedio General de Satisfacción
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs h-8"
          >
            Actualizar
          </Button>
        </div>

        {/* Listado de Personas */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-ink-secondary">
            <Loader2 className="w-6 h-6 animate-spin text-[#562599]" />
            <p className="text-xs font-semibold">Cargando evaluaciones de satisfacción...</p>
          </div>
        ) : personas.length === 0 ? (
          <div className="py-12 text-center text-ink-secondary space-y-1">
            <Sparkles className="w-8 h-8 mx-auto text-ink-tertiary" />
            <p className="text-sm font-bold text-ink-primary">Sin evaluaciones registradas</p>
            <p className="text-xs text-ink-secondary">
              Los beneficiarios aún no han enviado su calificación desde la app móvil.
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
            {personas.map((item) => {
              const fecha = item.updated_at || item.created_at;
              const fechaStr = fecha ? new Date(fecha).toLocaleDateString("es-PE", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }) : "—";

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-white border border-border-soft hover:border-purple-200 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center text-ink-secondary shrink-0 font-bold text-xs">
                      <User className="w-4 h-4 text-[#562599]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-ink-primary truncate">
                        {item.persona?.nombre || `Beneficiario #${item.persona_id}`}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-ink-secondary mt-0.5">
                        {item.persona?.dni && (
                          <span className="font-mono">DNI: {item.persona.dni}</span>
                        )}
                        {item.persona?.expediente && (
                          <span className="truncate max-w-[150px]">
                            • Exp: {item.persona.expediente}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {getNivelBadge(item.nivel, item.etiqueta)}
                    <span className="text-[10px] text-ink-tertiary flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {fechaStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
