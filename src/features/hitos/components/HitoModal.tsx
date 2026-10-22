import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Hito } from "../types/hito.types";

interface HitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  hitoToEdit?: Hito | null;
  onSave: (data: Partial<Hito>) => Promise<void>;
  isLoading?: boolean;
}

export function HitoModal({
  isOpen,
  onClose,
  hitoToEdit,
  onSave,
  isLoading,
}: HitoModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("12:00");
  const [toleranciaMinutos, setToleranciaMinutos] = useState(15);
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState<Hito["estado"]>("PROGRAMADO");
  const [totalEsperados, setTotalEsperados] = useState(100);

  useEffect(() => {
    if (hitoToEdit) {
      setNombre(hitoToEdit.nombre || "");
      setDescripcion(hitoToEdit.descripcion || "");
      setFecha(hitoToEdit.fecha || "");
      setHoraInicio(hitoToEdit.horaInicio || "08:00");
      setHoraFin(hitoToEdit.horaFin || "12:00");
      setToleranciaMinutos(hitoToEdit.toleranciaMinutos || 15);
      setUbicacion(hitoToEdit.ubicacion || "");
      setEstado(hitoToEdit.estado || "PROGRAMADO");
      setTotalEsperados(hitoToEdit.totalEsperados || 100);
    } else {
      setNombre("");
      setDescripcion("");
      setFecha(new Date().toISOString().split("T")[0]);
      setHoraInicio("08:00");
      setHoraFin("12:00");
      setToleranciaMinutos(15);
      setUbicacion("");
      setEstado("PROGRAMADO");
      setTotalEsperados(100);
    }
  }, [hitoToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      nombre,
      descripcion,
      fecha,
      horaInicio,
      horaFin,
      toleranciaMinutos: Number(toleranciaMinutos),
      ubicacion,
      estado,
      totalEsperados: Number(totalEsperados),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hitoToEdit ? "Editar Hito / Evento" : "Crear Nuevo Hito"}
      description="Configura el horario, tolerancia y sede para la toma de asistencias."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            type="submit"
          >
            {hitoToEdit ? "Guardar Cambios" : "Crear Hito"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del Hito"
          placeholder="Ej. Taller de Inducción - Grupo B"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Descripción / Alcance
          </label>
          <textarea
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve detalle de la actividad..."
            className="w-full rounded-field border border-linea bg-white px-4 py-2.5 text-sm text-carbon placeholder:text-carbon/40 focus:border-guinda focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
          <Input
            label="Hora Inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
          />
          <Input
            label="Hora Fin"
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tolerancia (Minutos)"
            type="number"
            min={0}
            max={60}
            value={toleranciaMinutos}
            onChange={(e) => setToleranciaMinutos(Number(e.target.value))}
            required
          />
          <Input
            label="Beneficiarios Esperados"
            type="number"
            min={1}
            value={totalEsperados}
            onChange={(e) => setTotalEsperados(Number(e.target.value))}
            required
          />
        </div>

        <Input
          label="Ubicación / Sede"
          placeholder="Ej. Auditorio Municipal - Piso 2"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          required
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as Hito["estado"])}
            className="w-full rounded-field border border-linea bg-white px-4 py-2.5 text-sm text-carbon font-medium focus:border-guinda focus:outline-none"
          >
            <option value="PROGRAMADO">PROGRAMADO</option>
            <option value="EN_CURSO">EN_CURSO</option>
            <option value="FINALIZADO">FINALIZADO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
