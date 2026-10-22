import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Shield, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useLoginMutation } from "../services/authApi";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "../services/authSlice";

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
      }).unwrap();

      if (response?.data?.token) {
        const usuarioData = response.data.usuario;
        dispatch(
          setCredentials({
            token: response.data.token,
            user: usuarioData || {
              identificador,
              nombre: "Administrador General",
              rol: "admin",
            },
          })
        );
        navigate(from, { replace: true });
      } else {
        setErrorMessage("Respuesta inválida del servidor");
      }
    } catch (err: unknown) {
      const error = err as { data?: { mensaje?: string; message?: string }; error?: string };
      const message =
        error.data?.mensaje ||
        error.data?.message ||
        error.error ||
        "Credenciales inválidas o servidor no disponible.";
      setErrorMessage(message);
    }
  };

  // Demo helper to allow quick login testing in dev
  const handleQuickDemo = () => {
    const demoToken = "demo-jwt-token-asistencia-2026";
    dispatch(
      setCredentials({
        token: demoToken,
        user: {
          identificador: "admin",
          nombre: "Administrador General",
          rol: "admin",
          correo: "admin@institucion.gob.pe",
        },
      })
    );
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-suave flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-card border border-linea shadow-lg p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-card bg-guinda text-white shadow-md mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-carbon tracking-tight">
              Control de Asistencia
            </h1>
            <p className="text-sm font-medium text-olivo mt-1">
              Plataforma Institucional de Supervisión
            </p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-field bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Identificador / DNI / Usuario"
              type="text"
              placeholder="Ej. admin o DNI"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-carbon cursor-pointer transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold"
              isLoading={isLoading}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Dev credentials demo button */}
          <div className="mt-6 pt-6 border-t border-linea text-center">
            <p className="text-xs text-olivo mb-2">¿Prueba rápida en desarrollo?</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleQuickDemo}
              className="w-full text-xs font-semibold"
            >
              Acceso Rápido de Demostración
            </Button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-olivo/70 font-medium">
          Sistema de Control de Asistencia &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
