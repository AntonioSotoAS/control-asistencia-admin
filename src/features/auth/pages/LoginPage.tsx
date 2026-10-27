import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useLoginMutation } from "../services/authApi";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "../services/authSlice";
import type { UserProfile } from "../types/auth.types";

export function LoginPage() {
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  useEffect(() => {
    const expiredMsg = sessionStorage.getItem("session_expired_msg");
    if (expiredMsg) {
      setErrorMessage(expiredMsg);
      sessionStorage.removeItem("session_expired_msg");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identificador.trim() || !password) {
      setErrorMessage("Por favor ingresa tu identificador y contraseña.");
      return;
    }

    try {
      const response = await login({
        identificador: identificador.trim(),
        password,
        codigo: "CONTROLASISTENCIA-WEB",
      }).unwrap();

      const token = response.token || response.data?.token;
      if (token) {
        const rawUserData =
          response.usuario ||
          response.data?.usuario ||
          response.user ||
          response.data?.user ||
          (response.data && typeof response.data === "object" && "identificador" in response.data
            ? (response.data as unknown as UserProfile)
            : undefined);

        const pantallas =
          rawUserData?.pantallas ||
          response.pantallas ||
          (Array.isArray(response.data?.pantallas) ? (response.data?.pantallas as string[]) : undefined);

        const rol = (rawUserData?.rol || "").toLowerCase().trim();
        if (rol === "beneficiario") {
          setErrorMessage("El beneficiario ingresa desde la aplicación.");
          return;
        }

        const usuarioFinal: UserProfile = {
          ...(rawUserData || {
            identificador,
            nombre: "Usuario del Sistema",
            rol: "admin",
          }),
          ...(pantallas ? { pantallas } : {}),
        };

        dispatch(
          setCredentials({
            token,
            user: usuarioFinal,
          })
        );
        navigate(from, { replace: true });
      } else {
        setErrorMessage("Respuesta inválida del servidor: token no recibido.");
      }
    } catch (err: unknown) {
      const error = err as {
        status?: number;
        data?: { mensaje?: string; message?: string; error?: string };
        error?: string;
      };
      const message =
        error.data?.mensaje ||
        error.data?.message ||
        error.data?.error ||
        error.error ||
        "Credenciales inválidas o servidor no disponible.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col lg:flex-row overflow-hidden bg-white selection:bg-[#73101a] selection:text-white">
      {/* Left Column: Form & Branding */}
      <div className="w-full lg:w-[44%] xl:w-[40%] 2xl:w-[36%] shrink-0 h-full flex flex-col justify-between px-6 sm:px-12 lg:px-10 xl:px-14 py-6 sm:py-8 relative z-10 bg-white overflow-y-auto">
        {/* Top-left decorative curved accent */}
        <div className="absolute top-0 left-0 w-28 h-36 sm:w-36 sm:h-48 pointer-events-none select-none z-0">
          <svg
            viewBox="0 0 160 220"
            className="w-full h-full text-[#73101a] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,0 L130,0 C100,55 45,140 0,200 Z" />
          </svg>
        </div>

        {/* Decorative organic divider curve attaching to right edge */}
        <svg
          className="absolute top-0 -right-16 xl:-right-20 h-full w-16 xl:w-20 text-white fill-current pointer-events-none hidden lg:block z-20"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L14,0 Q92,500 14,1000 L0,1000 Z" />
        </svg>

        {/* Empty space on top to balance vertical centering */}
        <div className="h-6 shrink-0" />

        {/* Form Container */}
        <div className="w-full max-w-[380px] sm:max-w-[400px] mx-auto z-10 my-auto py-4">
          {/* Emblem & Headers */}
          <div className="text-center mb-7">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-white border border-slate-200/90 p-2 shadow-lg shadow-slate-200/60 mb-4 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
              <img
                src="/logo/SIGMA-Logo-512.png"
                alt="SIGMA-T"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              SIGMA-T
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 max-w-[340px] mx-auto leading-snug">
              Sistema Integrado de Gestión y Monitoreo de Acompañamiento Terapéutico
            </p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-semibold leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs sm:text-sm font-bold text-slate-700">
                Identificador / DNI / Usuario
              </label>
              <div className="relative flex items-center">
                <User className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Ej. admin o DNI"
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  autoComplete="username"
                  required
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 rounded-2xl border border-slate-200 bg-[#f8fafc]/50 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#73101a] focus:ring-4 focus:ring-[#73101a]/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs sm:text-sm font-bold text-slate-700">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full pl-12 pr-12 py-3 sm:py-3.5 rounded-2xl border border-slate-200 bg-[#f8fafc]/50 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:border-[#73101a] focus:ring-4 focus:ring-[#73101a]/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#73101a] hover:bg-[#5e0c15] active:bg-[#4d0911] text-white font-bold text-sm sm:text-base tracking-wide shadow-md shadow-[#73101a]/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-4 text-center text-xs text-slate-400 font-medium z-10 shrink-0">
          SIGMA-T &copy; {new Date().getFullYear()}
        </footer>
      </div>

      {/* Right Column: Visual Showcase */}
      <div className="hidden lg:block lg:flex-1 h-full relative overflow-hidden bg-[#e6e2da] select-none">
        <img
          src="/img/login/fondo_derecho_control_asistencia.png"
          alt="SIGMA-T"
          className="w-full h-full object-cover object-center scale-[1.01]"
        />
      </div>
    </div>
  );
}

export default LoginPage;
