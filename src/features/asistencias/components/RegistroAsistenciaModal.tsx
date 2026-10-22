import React, { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";
import { QrCode, ScanLine, CheckCircle2 } from "lucide-react";
import type { RegistroAsistenciaPayload } from "../types/asistencia.types";

interface RegistroAsistenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar: (payload: RegistroAsistenciaPayload) => Promise<void>;
  isLoading?: boolean;
}

export function RegistroAsistenciaModal({
  isOpen,
  onClose,
  onRegistrar,
  isLoading,
}: RegistroAsistenciaModalProps) {
  const [dni, setDni] = useState("");
  const [hitoId, setHitoId] = useState("1");
  const [metodo, setMetodo] = useState<"QR" | "DNI_MANUAL" | "BIOMETRICO">("QR");
  const [observacion, setObservacion] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || dni.length !== 8) return;

    await onRegistrar({
      dni,
      hitoId,
      metodo,
      observacion: observacion || undefined,
    });

    setSuccessMessage(`Asistencia registrada con éxito para DNI ${dni}`);
    setDni("");
    setObservacion("");
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Marcar Asistencia"
      description="Registra la asistencia en tiempo real mediante QR, huella o DNI manual."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cerrar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={dni.length !== 8}
            type="submit"
          >
            Confirmar Registro
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {successMessage && (
          <div className="p-3.5 rounded-field bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Hito / Evento Activo
          </label>
          <select
            value={hitoId}
            onChange={(e) => setHitoId(e.target.value)}
            className="w-full rounded-field border border-linea bg-white px-4 py-2.5 text-sm text-carbon font-semibold focus:border-guinda focus:outline-none"
          >
            <option value="1">Taller de Capacitación en Emprendimiento (08:30 - 12:30)</option>
            <option value="2">Entrega de Módulos Nutricionales Octubre (09:00 - 14:00)</option>
          </select>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Método de Captura
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "QR", label: "Código QR", icon: QrCode },
              { id: "BIOMETRICO", label: "Biométrico", icon: ScanLine },
              { id: "DNI_MANUAL", label: "Manual", icon: ScanLine },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = metodo === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetodo(m.id as "QR" | "DNI_MANUAL" | "BIOMETRICO")}
                  className={`flex flex-col items-center justify-center p-3 rounded-tile border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "border-guinda bg-guinda/5 text-guinda"
                      : "border-linea bg-white text-olivo hover:bg-suave"
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="DNI del Beneficiario"
          placeholder="Ingrese o escanee 8 dígitos"
          maxLength={8}
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
          autoFocus
          required
        />

        <Input
          label="Observaciones (opcional)"
          placeholder="Ej. Ingreso autorizado con pase especial"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
        />
      </form>
    </Modal>
  );
}
