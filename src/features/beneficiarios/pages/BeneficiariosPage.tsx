import { useState, useMemo } from "react";
import { BeneficiarioFilter } from "../components/BeneficiarioFilter";
import { BeneficiariosTable } from "../components/BeneficiariosTable";
import { BeneficiarioModal } from "../components/BeneficiarioModal";
import {
  useGetBeneficiariosQuery,
  useCrearBeneficiarioMutation,
  useActualizarBeneficiarioMutation,
} from "../services/beneficiariosApi";
import type { Beneficiario } from "../types/beneficiario.types";

const fallbackBeneficiarios: Beneficiario[] = [
  {
    id: 1,
    dni: "45892134",
    nombres: "Carlos Alberto",
    apellidos: "Mendoza Quispe",
    programa: "Comedor Popular",
    estado: "ACTIVO",
    telefono: "987654321",
    correo: "carlos.mendoza@gmail.com",
    fechaRegistro: "2026-01-10",
  },
  {
    id: 2,
    dni: "71283940",
    nombres: "María Elena",
    apellidos: "Huamán Tello",
    programa: "Vaso de Leche",
    estado: "ACTIVO",
    telefono: "991234567",
    correo: "maria.huaman@outlook.com",
    fechaRegistro: "2026-01-12",
  },
  {
    id: 3,
    dni: "40928371",
    nombres: "Juan Alberto",
    apellidos: "Ramos Salazar",
    programa: "Pensión 65",
    estado: "ACTIVO",
    telefono: "976543210",
    correo: "juan.ramos@yahoo.com",
    fechaRegistro: "2026-02-01",
  },
  {
    id: 4,
    dni: "47291038",
    nombres: "Rosa Luz",
    apellidos: "Palacios Vega",
    programa: "Capacitación Juvenil",
    estado: "SUSPENDIDO",
    telefono: "981293847",
    correo: "rosa.palacios@gmail.com",
    fechaRegistro: "2026-02-15",
  },
  {
    id: 5,
    dni: "43928172",
    nombres: "Luis Fernando",
    apellidos: "Castro Flores",
    programa: "Comedor Popular",
    estado: "INACTIVO",
    telefono: "965412398",
    fechaRegistro: "2026-03-01",
  },
];

export function BeneficiariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBeneficiario, setEditingBeneficiario] = useState<Beneficiario | null>(null);

  const { data: apiData, isLoading } = useGetBeneficiariosQuery();
  const [crearBeneficiario, { isLoading: isCreating }] = useCrearBeneficiarioMutation();
  const [actualizarBeneficiario, { isLoading: isUpdating }] = useActualizarBeneficiarioMutation();

  const [localData, setLocalData] = useState<Beneficiario[]>(fallbackBeneficiarios);

  const dataList = apiData && apiData.length > 0 ? apiData : localData;

  const filteredBeneficiarios = useMemo(() => {
    return dataList.filter((b) => {
      const matchesSearch =
        b.dni.includes(searchTerm) ||
        `${b.nombres} ${b.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "TODOS" || b.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dataList, searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingBeneficiario(null);
    setIsModalOpen(true);
  };

  const handleEdit = (beneficiario: Beneficiario) => {
    setEditingBeneficiario(beneficiario);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Beneficiario>) => {
    if (editingBeneficiario) {
      try {
        await actualizarBeneficiario({ id: editingBeneficiario.id, data }).unwrap();
      } catch {
        // Fallback update in state if backend is unavailable
        setLocalData((prev) =>
          prev.map((item) =>
            item.id === editingBeneficiario.id ? ({ ...item, ...data } as Beneficiario) : item
          )
        );
      }
    } else {
      try {
        await crearBeneficiario(data).unwrap();
      } catch {
        // Fallback add in state
        const newBeneficiario: Beneficiario = {
          id: Date.now(),
          dni: data.dni || "00000000",
          nombres: data.nombres || "",
          apellidos: data.apellidos || "",
          programa: data.programa || "Vaso de Leche",
          estado: data.estado || "ACTIVO",
          telefono: data.telefono,
          correo: data.correo,
          fechaRegistro: new Date().toISOString().split("T")[0],
        };
        setLocalData((prev) => [newBeneficiario, ...prev]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <BeneficiarioFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenCreateModal={handleOpenCreateModal}
      />

      <BeneficiariosTable
        beneficiarios={filteredBeneficiarios}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      <BeneficiarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        beneficiarioToEdit={editingBeneficiario}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

export default BeneficiariosPage;
