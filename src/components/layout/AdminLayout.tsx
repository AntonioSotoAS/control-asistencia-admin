import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/services/authSlice";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // If not authenticated, redirect to login
    const savedToken = sessionStorage.getItem("token") || token;
    if (!savedToken) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    // Role validation: Beneficiaries are not permitted on the web platform
    const currentRole = (user?.rol || "").toLowerCase().trim();
    if (currentRole === "beneficiario") {
      dispatch(logout());
      sessionStorage.setItem("session_expired_msg", "El beneficiario ingresa desde la aplicación.");
      navigate("/login", { replace: true });
    }
  }, [token, user, dispatch, navigate, location]);

  return (
    <div className="flex min-h-screen bg-suave text-carbon">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
