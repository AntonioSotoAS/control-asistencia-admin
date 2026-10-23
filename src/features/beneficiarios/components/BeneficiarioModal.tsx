import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import type { Beneficiario, SeguimientoTipo } from "../types/beneficiario.types";

interface BeneficiarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiarioToEdit?: Beneficiario | null;
  onSave: (data: Partial<Beneficiario>) => Promise<void>;
  isLoading?: boolean;
}

export function BeneficiarioModal({
  isOpen,
  onClose,
  beneficiarioToEdit,
  onSave,
  isLoading,
}: BeneficiarioModalProps) {
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [expediente, setExpediente] = useState("");
  const [juzgado, setJuzgado] = useState("");
  const [seguimiento, setSeguimiento] = useState<SeguimientoTipo>("en_curso");

  useEffect(() => {
    if (beneficiarioToEdit) {
      setDni(beneficiarioToEdit.dni || "");
      setNombre(beneficiarioToEdit.nombre || "");
      setTelefono(beneficiarioToEdit.telefono || "");
      setEmail(beneficiarioToEdit.email || "");
      setExpediente(beneficiarioToEdit.expediente || "");
      setJuzgado(beneficiarioToEdit.juzgado || "");
      setSeguimiento((beneficiarioToEdit.seguimiento as SeguimientoTipo) || "en_curso");
    } else {
      setDni("");
      setNombre("");
      setTelefono("");
      setEmail("");
      setExpediente("");
      setJuzgado("");
      setSeguimiento("en_curso");
    }
  }, [beneficiarioToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      dni,
      nombre,
      telefono,
      email,
      expediente,
      juzgado,
      seguimiento,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={beneficiarioToEdit ? "Editar Beneficiario" : "Registrar Beneficiario"}
      description="Datos personales y expediente judicial del beneficiario."
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
            {beneficiarioToEdit ? "Guardar Cambios" : "Guardar"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de DNI"
            placeholder="8 dígitos"
            maxLength={8}
            value={dni}
            onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
            required
          />

          <Input
            label="Nombre Completo"
            placeholder="Nombres y Apellidos"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de Expediente"
            placeholder="Ej. 00128-2025-0-2501-JR-FT-02"
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
          />

          <Input
            label="Juzgado Asignado"
            placeholder="Ej. Segundo Juzgado de Familia"
            value={juzgado}
            onChange={(e) => setJuzgado(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Teléfono Móvil"
            placeholder="9 dígitos"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Estado de Seguimiento
          </label>
          <select
            value={seguimiento}
            onChange={(e) => setSeguimiento(e.target.value as SeguimientoTipo)}
            className="w-full rounded-field border border-linea bg-white px-3 py-2 text-xs font-semibold text-carbon focus:border-guinda focus:outline-none"
          >
            <option value="en_curso">En Curso</option>
            <option value="cumple">Cumple</option>
            <option value="alerta">En Alerta</option>
            <option value="incumplimiento">Incumplimiento</option>
            <option value="culminado">Culminado</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
