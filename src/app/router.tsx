import { Routes, Route, Navigate } from "react-router";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { BeneficiariosPage } from "@/features/beneficiarios/pages/BeneficiariosPage";
import { HitosPage } from "@/features/hitos/pages/HitosPage";
import { AsistenciasPage } from "@/features/asistencias/pages/AsistenciasPage";
import { JustificacionesPage } from "@/features/justificaciones/pages/JustificacionesPage";
import { ReportesPage } from "@/features/reportes/pages/ReportesPage";
import { UsuariosPage } from "@/features/usuarios/pages/UsuariosPage";
import { PersonasPage } from "@/features/personas/pages/PersonasPage";

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
        <Route path="asistencias" element={<AsistenciasPage />} />
        <Route path="justificaciones" element={<JustificacionesPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="personas" element={<PersonasPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
