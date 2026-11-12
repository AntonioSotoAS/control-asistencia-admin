import React, { useState, useEffect } from "react";
import { Modal, Button, Input } from "@/components/ui";
import {
  Search,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Scale,
} from "lucide-react";
import { useBuscarActoPorDocumentoMutation } from "@/features/actos-procesales/services/actosProcesalesApi";
import {
  useCrearPersonaMutation,
  useActualizarPersonaMutation,
} from "../services/personasApi";
import { useCrearUsuarioMutation } from "@/features/usuarios/services/usuariosApi";
import type { Persona, ActualizarPersonaPayload } from "../types/persona.types";
import type { ActoProcesalCaso } from "@/features/actos-procesales/types/actoProcesal.types";

interface PersonaUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaToEdit?: Persona | null;
  initialDni?: string;
  onSuccess?: (msg: string) => void;
}

export function PersonaUsuarioModal({
  isOpen,
  onClose,
  personaToEdit,
  initialDni,
  onSuccess,
}: PersonaUsuarioModalProps) {
  const isEditing = Boolean(personaToEdit);

  // Paso 1: Documento
  const [dni, setDni] = useState("");
  const [isSearchingDni, setIsSearchingDni] = useState(false);
  const [casosEncontrados, setCasosEncontrados] = useState<ActoProcesalCaso[]>([]);
  const [personaExistente, setPersonaExistente] = useState<{
    id: number;
    nombre: string;
    tiene_cuenta: boolean;
  } | null>(null);

  // Paso 2: Datos de la Persona
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [expediente, setExpediente] = useState("");
  const [juzgado, setJuzgado] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [seguimiento, setSeguimiento] = useState("sin_seguimiento");

  // Paso 3: Cuenta de Acceso
  const [crearCuenta, setCrearCuenta] = useState(true);
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rol, setRol] = useState("beneficiario");
  const [cuentaActiva, setCuentaActiva] = useState(true);

  // Mensajes de estado y validación
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Mutations
  const [buscarActo] = useBuscarActoPorDocumentoMutation();
  const [crearPersona, { isLoading: isCreatingPersona }] = useCrearPersonaMutation();
  const [actualizarPersona, { isLoading: isUpdatingPersona }] = useActualizarPersonaMutation();
  const [crearUsuario, { isLoading: isCreatingUsuario }] = useCrearUsuarioMutation();

  const isSubmitting = isCreatingPersona || isUpdatingPersona || isCreatingUsuario;

  useEffect(() => {
    setErrorMessage(null);
    setInfoMessage(null);
    setFieldErrors({});
    setCasosEncontrados([]);
    setPersonaExistente(null);

    if (personaToEdit) {
      setDni(personaToEdit.dni || "");
      // Dividir el nombre completo en nombres y apellidos si es posible
      const partes = (personaToEdit.nombre || "").trim().split(/\s+/);
      if (partes.length >= 3) {
        setApellidoMaterno(partes[partes.length - 1]);
        setApellidoPaterno(partes[partes.length - 2]);
        setNombres(partes.slice(0, partes.length - 2).join(" "));
      } else {
        setNombres(personaToEdit.nombre || "");
        setApellidoPaterno("");
        setApellidoMaterno("");
      }
      setExpediente(personaToEdit.expediente || "");
      setJuzgado(personaToEdit.juzgado || "");
      setCorreo(personaToEdit.email || "");
      setTelefono(personaToEdit.telefono || "");
      setSeguimiento(personaToEdit.seguimiento || "sin_seguimiento");
      setCrearCuenta(false);
    } else {
      const initDniClean = (initialDni || "").replace(/\D/g, "").slice(0, 8);
      setDni(initDniClean);
      setNombres("");
      setApellidoPaterno("");
      setApellidoMaterno("");
      setExpediente("");
      setJuzgado("");
      setCorreo("");
      setTelefono("");
      setSeguimiento("sin_seguimiento");
      setCrearCuenta(true);
      setIdentificador(initDniClean);
      setPassword("");
      setRol("beneficiario");
      setCuentaActiva(true);

      if (initDniClean.length === 8 && isOpen) {
        handleBuscarPorDocumento(initDniClean);
      }
    }
  }, [personaToEdit, isOpen, initialDni]);

  // Actualizar identificador automáticamente cuando cambia el DNI
  const handleDniChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 8);
    setDni(cleaned);
    if (!personaToEdit) {
      setIdentificador(cleaned);
    }
  };

  // Buscar en Expedientes por documento (GET /api/actos-procesales/por-documento)
  const handleBuscarPorDocumento = async (docOverride?: string) => {
    const targetDoc = (docOverride ?? dni).trim();
    if (!targetDoc || targetDoc.length !== 8) {
      setErrorMessage("Ingresa un DNI de 8 dígitos para consultar los expedientes.");
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setIsSearchingDni(true);

    try {
      const data = await buscarActo(targetDoc).unwrap();

      if (data) {
        setNombres(data.nombres || "");
        setApellidoPaterno(data.apellido_paterno || "");
        setApellidoMaterno(data.apellido_materno || "");
        setIdentificador(data.dni || dni.trim());

        if (data.casos && data.casos.length > 0) {
          setCasosEncontrados(data.casos);
          setExpediente(data.casos[0].expediente || "");
          setJuzgado(data.casos[0].juzgado || "");
        }

        if (data.persona_existente) {
          setPersonaExistente(data.persona_existente);
          setInfoMessage(
            `Persona ya registrada en el padrón: ${data.persona_existente.nombre} (ID #${data.persona_existente.id}). ${
              data.persona_existente.tiene_cuenta
                ? "Ya cuenta con usuario de acceso."
                : "Puedes registrar su cuenta de acceso."
            }`
          );
          if (data.persona_existente.tiene_cuenta) {
            setCrearCuenta(false);
          }
        } else {
          setPersonaExistente(null);
          setInfoMessage(
            `Datos encontrados en expedientes para ${data.nombre}. Se autocompletaron los campos.`
          );
        }
      }
    } catch (err: any) {
      if (err?.status === 404) {
        setInfoMessage(
          "No se encontraron expedientes previos para este DNI. Puedes ingresar los datos manualmente."
        );
      } else {
        setErrorMessage(
          err?.data?.message || err?.data?.mensaje || "Error al consultar los expedientes por documento."
        );
      }
    } finally {
      setIsSearchingDni(false);
    }
  };

  const handleSeleccionarCaso = (caso: ActoProcesalCaso) => {
    setExpediente(caso.expediente);
    setJuzgado(caso.juzgado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!dni.trim() || dni.trim().length !== 8) {
      setErrorMessage("El DNI debe contener exactamente 8 dígitos.");
      return;
    }

    if (!nombres.trim()) {
      setErrorMessage("El campo Nombres es requerido.");
      return;
    }

    const nombreCompleto = [nombres.trim(), apellidoPaterno.trim(), apellidoMaterno.trim()]
      .filter(Boolean)
      .join(" ");

    if (crearCuenta) {
      if (!identificador.trim()) {
        setErrorMessage("El identificador de acceso es requerido.");
        return;
      }
      if (!password.trim() || password.length < 8) {
        setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
    }

    try {
      if (isEditing && personaToEdit) {
        // Actualizar persona existente
        const payload: ActualizarPersonaPayload = {
          id: personaToEdit.id,
          nombre: nombreCompleto,
          dni: dni.trim(),
          email: correo.trim() || undefined,
          telefono: telefono.trim() || undefined,
          expediente: expediente.trim() || undefined,
          juzgado: juzgado.trim() || undefined,
          seguimiento: seguimiento !== "sin_seguimiento" ? seguimiento : undefined,
        };
        await actualizarPersona(payload).unwrap();
        onSuccess?.(`Datos de ${nombreCompleto} actualizados exitosamente.`);
        onClose();
      } else {
        // Flujo en 2 pasos secuenciales:
        // 1. Primero se envía y crea la persona (POST /api/personas)
        let targetPersonaId: number;

        if (personaExistente) {
          targetPersonaId = personaExistente.id;
        } else {
          const personaResp: any = await crearPersona({
            nombre: nombreCompleto,
            dni: dni.trim(),
            email: correo.trim() || undefined,
            telefono: telefono.trim() || undefined,
            expediente: expediente.trim() || undefined,
            juzgado: juzgado.trim() || undefined,
            seguimiento: seguimiento !== "sin_seguimiento" ? seguimiento : undefined,
          }).unwrap();

          targetPersonaId = Number(personaResp?.id || personaResp?.data?.id);
        }

        // 2. Con la persona ya creada y respondiendo con su ID, recién se crea la cuenta de usuario (POST /api/usuarios)
        if (crearCuenta && targetPersonaId) {
          await crearUsuario({
            persona_id: targetPersonaId,
            identificador: identificador.trim(),
            password: password.trim(),
            rol: rol as any,
            estado: cuentaActiva ? "activo" : "inactivo",
          }).unwrap();

          onSuccess?.(
            `Persona "${nombreCompleto}" registrada y cuenta de acceso creada correctamente.`
          );
        } else {
          onSuccess?.(`Persona "${nombreCompleto}" registrada exitosamente en el padrón.`);
        }

        onClose();
      }
    } catch (err: any) {
      const apiErrors = err?.data?.errors || {};
      setFieldErrors(apiErrors);
      const msg =
        err?.data?.message ||
        err?.data?.mensaje ||
        err?.message ||
        "Error al procesar el registro en el servidor.";
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modificar Persona" : "Registrar persona y cuenta"}
      description="Formulario unificado con búsqueda automática en expedientes de la Corte y creación de credenciales."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} type="button">
            Cancelar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4 text-white" />}
            className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold shadow-xs px-4"
          >
            {isEditing
              ? "Guardar Cambios"
              : crearCuenta
              ? "Registrar persona y cuenta"
              : "Registrar persona"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Banner de error */}
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{errorMessage}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                  {Object.entries(fieldErrors).map(([field, msgs]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {msgs.join(", ")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Banner de información de búsqueda */}
        {infoMessage && (
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#562599] shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* =========================================================================
            SECCIÓN 1: DOCUMENTO
        ========================================================================= */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-ink-primary block">
            Documento
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={dni}
                onChange={(e) => handleDniChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleBuscarPorDocumento();
                  }
                }}
                placeholder="Número de DNI (8 dígitos) *"
                maxLength={8}
                required
                className="font-mono text-sm tracking-wider"
              />
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleBuscarPorDocumento()}
              isLoading={isSearchingDni}
              className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold h-10 px-3.5 shadow-xs"
              title="Buscar nombres y expedientes en la base judicial"
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span>Buscar</span>
            </Button>
          </div>
          <p className="text-[11px] text-ink-secondary">
            Presiona <strong>Buscar</strong> para autocompletar nombres, apellidos y expedientes desde la base judicial.
          </p>
        </div>

        {/* Casos encontrados en expedientes */}
        {casosEncontrados.length > 1 && (
          <div className="p-3 bg-surface-muted/50 rounded-lg border border-border-soft space-y-2">
            <span className="text-[11px] font-bold text-ink-primary flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#562599]" />
              Se encontraron {casosEncontrados.length} expedientes asociados. Selecciona uno:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {casosEncontrados.map((caso, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSeleccionarCaso(caso)}
                  className={`p-2 rounded border text-left transition-colors ${
                    expediente === caso.expediente
                      ? "bg-purple-50 border-[#562599] text-[#562599] font-bold"
                      : "bg-white border-border-soft hover:bg-surface-muted text-ink-secondary"
                  }`}
                >
                  <div className="font-mono">{caso.expediente}</div>
                  <div className="text-[10px] truncate">{caso.juzgado}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECCIÓN 2: DATOS DE LA PERSONA
        ========================================================================= */}
        <div className="space-y-3 pt-2 border-t border-border-soft">
          <label className="text-xs font-black uppercase tracking-wider text-ink-primary block">
            Datos de la persona
          </label>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-ink-secondary uppercase">
              Nombres *
            </label>
            <Input
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ej: JEMNI OBIDIO"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-ink-secondary uppercase">
                Apellido paterno
              </label>
              <Input
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                placeholder="Ej: ASUNCION"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-ink-secondary uppercase">
                Apellido materno
              </label>
              <Input
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                placeholder="Ej: AVILA"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-ink-secondary uppercase">
              Expediente
            </label>
            <Input
              value={expediente}
              onChange={(e) => setExpediente(e.target.value)}
              placeholder="Ej: 06287-2026-0-2506-JR-FT-02"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-ink-secondary uppercase">
              Juzgado
            </label>
            <Input
              value={juzgado}
              onChange={(e) => setJuzgado(e.target.value)}
              placeholder="Ej: 2° JUZGADO DE FAMILIA TRANSITORIO"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-ink-secondary uppercase">
                Correo Electrónico
              </label>
              <Input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-ink-secondary uppercase">
                Teléfono / Celular
              </label>
              <Input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 987654321"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-ink-secondary uppercase">
              Estado de Seguimiento
            </label>
            <select
              value={seguimiento}
              onChange={(e) => setSeguimiento(e.target.value)}
              className="w-full text-xs font-semibold bg-surface-muted/60 border border-border-soft rounded-lg px-3 py-2.5 text-ink-primary focus:outline-none focus:border-[#562599] focus:bg-white transition"
            >
              <option value="sin_seguimiento">Sin seguimiento</option>
              <option value="en_curso">En curso</option>
              <option value="cumple">Cumple</option>
              <option value="alerta">En alerta</option>
              <option value="incumplimiento">Incumplimiento</option>
              <option value="culminado">Culminado</option>
            </select>
          </div>
        </div>

        {/* =========================================================================
            SECCIÓN 3: CUENTA DE ACCESO
        ========================================================================= */}
        <div className="space-y-3 pt-3 border-t border-border-soft">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-ink-primary flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#562599]" />
              <span>Cuenta de acceso</span>
            </label>

            {!isEditing && (
              <label className="flex items-center gap-2 text-xs font-bold text-ink-primary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={crearCuenta}
                  onChange={(e) => setCrearCuenta(e.target.checked)}
                  className="accent-[#562599] w-4 h-4 cursor-pointer rounded"
                />
                <span>Habilitar cuenta</span>
              </label>
            )}
          </div>

          {crearCuenta && (
            <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-200/80 space-y-3 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-secondary uppercase">
                  Identificador de Usuario *
                </label>
                <Input
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="Ej: 42916753"
                  required={crearCuenta}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-secondary uppercase">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required={crearCuenta}
                    className="pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-ink-secondary uppercase">
                  Rol Asignado *
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-border-soft rounded-lg px-3 py-2 text-ink-primary focus:outline-none focus:border-[#562599]"
                >
                  <option value="beneficiario">Beneficiario</option>
                  <option value="asistente">Asistente / Operador</option>
                  <option value="juez">Juez / Supervisor</option>
                  <option value="admin">Administrador</option>
                  <option value="superadmin">Superadministrador</option>
                </select>
              </div>

              {/* Switch Cuenta activa */}
              <div className="flex items-center justify-between pt-2 border-t border-purple-200/60">
                <div>
                  <span className="text-xs font-bold text-ink-primary block">Cuenta activa</span>
                  <span className="text-[11px] text-ink-secondary">
                    {cuentaActiva ? "El usuario puede iniciar sesión en la plataforma." : "Acceso deshabilitado temporalmente."}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cuentaActiva}
                    onChange={(e) => setCuentaActiva(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border-soft peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#562599]"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
