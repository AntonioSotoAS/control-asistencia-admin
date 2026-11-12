import { Routes, Route, Navigate } from "react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { BeneficiariosPage } from "@/features/beneficiarios/pages/BeneficiariosPage";
import { HitosPage } from "@/features/hitos/pages/HitosPage";
import { AsistenciasPage } from "@/features/asistencias/pages/AsistenciasPage";
import { JustificacionesPage } from "@/features/justificaciones/pages/JustificacionesPage";
// Reportes eliminado según requerimiento
// import { ReportesPage } from "@/features/reportes/pages/ReportesPage";
import { CuentasAccesoPage } from "@/features/usuarios";
import { RolesPage } from "@/features/roles/pages/RolesPage";
import { PantallasPage } from "@/features/pantallas/pages/PantallasPage";
import { FaqsPage } from "@/features/faqs/pages/FaqsPage";
import { ActosProcesalesPage } from "@/features/actos-procesales/pages/ActosProcesalesPage";

export function AppRouter() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Routes */}
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="beneficiarios" element={<BeneficiariosPage />} />
        <Route path="hitos" element={<HitosPage />} />
        <Route path="admin/hitos" element={<HitosPage />} />
        <Route path="asistencias" element={<AsistenciasPage />} />
        <Route path="justificaciones" element={<JustificacionesPage />} />
        {/* <Route path="reportes" element={<ReportesPage />} /> */}
        <Route path="expedientes" element={<ActosProcesalesPage />} />
        <Route path="actos-procesales" element={<ActosProcesalesPage />} />
        <Route path="usuarios" element={<CuentasAccesoPage />} />
        <Route path="cuentas" element={<CuentasAccesoPage />} />
        <Route path="cuentas-acceso" element={<CuentasAccesoPage />} />
        <Route path="personas" element={<CuentasAccesoPage defaultTab="personas" />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="pantallas" element={<PantallasPage />} />
        <Route path="faqs" element={<FaqsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
