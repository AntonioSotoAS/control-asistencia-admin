import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Beneficiario } from "../types/beneficiario.types";

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
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [programa, setPrograma] = useState("Vaso de Leche");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<"ACTIVO" | "INACTIVO" | "SUSPENDIDO">("ACTIVO");

  useEffect(() => {
    if (beneficiarioToEdit) {
      setDni(beneficiarioToEdit.dni || "");
      setNombres(beneficiarioToEdit.nombres || "");
      setApellidos(beneficiarioToEdit.apellidos || "");
      setPrograma(beneficiarioToEdit.programa || "Vaso de Leche");
      setTelefono(beneficiarioToEdit.telefono || "");
      setCorreo(beneficiarioToEdit.correo || "");
      setEstado(beneficiarioToEdit.estado || "ACTIVO");
    } else {
      setDni("");
      setNombres("");
      setApellidos("");
      setPrograma("Vaso de Leche");
      setTelefono("");
      setCorreo("");
      setEstado("ACTIVO");
    }
  }, [beneficiarioToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      dni,
      nombres,
      apellidos,
      programa,
      telefono,
      correo,
      estado,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={beneficiarioToEdit ? "Editar Beneficiario" : "Registrar Nuevo Beneficiario"}
      description="Ingresa los datos personales y de contacto del padrón general."
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
            {beneficiarioToEdit ? "Guardar Cambios" : "Registrar"}
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

          <div className="space-y-1.5 text-left">
            <label className="block text-sm font-semibold text-carbon">
              Programa Social
            </label>
            <select
              value={programa}
              onChange={(e) => setPrograma(e.target.value)}
              className="w-full rounded-field border border-linea bg-white px-4 py-2.5 text-sm text-carbon font-medium focus:border-guinda focus:outline-none"
            >
              <option value="Vaso de Leche">Vaso de Leche</option>
              <option value="Comedor Popular">Comedor Popular</option>
              <option value="Pensión 65">Pensión 65</option>
              <option value="Capacitación Juvenil">Capacitación Juvenil</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombres"
            placeholder="Ej. Juan Carlos"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            required
          />
          <Input
            label="Apellidos"
            placeholder="Ej. Pérez Quispe"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Teléfono Celular"
            placeholder="9 dígitos"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="opcional@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-sm font-semibold text-carbon">
            Estado de Inscripción
          </label>
          <div className="flex gap-4">
            {(["ACTIVO", "INACTIVO", "SUSPENDIDO"] as const).map((est) => (
              <label key={est} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-carbon">
                <input
                  type="radio"
                  name="estado"
                  value={est}
                  checked={estado === est}
                  onChange={() => setEstado(est)}
                  className="accent-guinda"
                />
                {est}
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
