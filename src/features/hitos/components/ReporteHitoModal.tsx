import { useRef } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import {
  Printer,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Loader2,
  Download,
} from "lucide-react";
import { useGetHitoAdminByIdQuery } from "../services/hitosApi";
import type { HitoAdmin } from "../types/hito.types";

interface ReporteHitoModalProps {
  isOpen: boolean;
  onClose: () => void;
  hitoId: number | null;
  hitoFallback?: HitoAdmin | null;
}

export function ReporteHitoModal({
  isOpen,
  onClose,
  hitoId,
  hitoFallback,
}: ReporteHitoModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const { data: hitoQuery, isLoading } = useGetHitoAdminByIdQuery(hitoId!, {
    skip: !isOpen || !hitoId,
  });

  if (!isOpen) return null;

  const hito = hitoQuery || hitoFallback;
  const persona = hito?.persona;
  const sesiones = hito?.sesiones || [];
  const total = hito?.sesiones_totales || hito?.sesiones_count || sesiones.length || 0;
  const asistidas = hito?.sesiones_completadas || hito?.asistencias_count || 0;
  const faltas = Math.max(0, total - asistidas);
  const porcentaje = hito?.porcentaje_avance ?? (total > 0 ? Math.round((asistidas / total) * 100) : 0);
  const isCumplido = porcentaje >= 100;
  const isValida = hito?.revision === "valida";

  const fechaEmision = new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const correlativo = `REP-${hito?.id || "00"}-${persona?.dni || "00000000"}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    if (!printAreaRef.current) return;

    const printWindow = window.open("", "_blank", "width=850,height=1000");
    if (!printWindow) {
      window.print();
      return;
    }

    const contentHtml = printAreaRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Constancia_Cumplimiento_Hito_${persona?.dni || "beneficiario"}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 16mm 14mm 16mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 10.5pt;
            line-height: 1.45;
          }
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #562599;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .print-logo {
            font-size: 20pt;
            font-weight: 900;
            color: #562599;
            letter-spacing: -0.5px;
          }
          .print-sublogo {
            font-size: 8pt;
            color: #555555;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .print-meta {
            text-align: right;
            font-size: 8.5pt;
            color: #4b5563;
          }
          .print-title-box {
            text-align: center;
            background: #f7f5fa;
            border: 1px solid #e5dcf4;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 16px;
          }
          .print-title {
            font-size: 13pt;
            font-weight: 800;
            color: #562599;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .print-subtitle {
            font-size: 8.5pt;
            color: #4b5563;
            margin-top: 3px;
          }
          .section-title {
            font-size: 10pt;
            font-weight: 700;
            color: #562599;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-top: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 16px;
            font-size: 9.5pt;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px 12px;
            font-size: 9.5pt;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-size: 7.5pt;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
          }
          .info-value {
            font-size: 9.5pt;
            font-weight: 600;
            color: #111827;
          }
          .badge-box {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 8.5pt;
            font-weight: 700;
            text-transform: uppercase;
          }
          .badge-success {
            background-color: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
          }
          .badge-purple {
            background-color: #f3e8ff;
            color: #562599;
            border: 1px solid #d8b4fe;
          }
          .badge-warning {
            background-color: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 12px;
            font-size: 9pt;
          }
          th {
            background-color: #f9fafb;
            color: #374151;
            font-weight: 700;
            text-align: left;
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            font-size: 8pt;
            text-transform: uppercase;
          }
          td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            color: #1f2937;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .dictamen-box {
            background-color: #faf9fc;
            border-left: 4px solid #562599;
            padding: 10px 12px;
            margin-top: 14px;
            margin-bottom: 24px;
            font-size: 9pt;
            color: #374151;
            line-height: 1.5;
            border-radius: 0 4px 4px 0;
          }
          .signatures-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 45px;
            page-break-inside: avoid;
          }
          .signature-box {
            text-align: center;
            padding-top: 8px;
            border-top: 1px dashed #6b7280;
          }
          .signature-name {
            font-size: 9.5pt;
            font-weight: 700;
            color: #111827;
            margin-top: 4px;
          }
          .signature-role {
            font-size: 8pt;
            color: #6b7280;
            text-transform: uppercase;
          }
          .print-footer {
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 7.5pt;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        ${contentHtml}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reporte Oficial de Cumplimiento de Hito"
      description="Visualización previa del documento formal para presentación judicial y archivo."
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-ink-secondary">
            Folio: <span className="font-mono font-semibold">{correlativo}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4 text-white" />}
              className="bg-[#562599] hover:bg-[#471e7f] text-white font-bold shadow-xs"
            >
              Imprimir / Guardar PDF
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-ink-secondary">
          <Loader2 className="w-8 h-8 animate-spin text-[#562599]" />
          <p className="text-xs font-semibold">Generando reporte del hito desde la base de datos...</p>
        </div>
      ) : !hito ? (
        <div className="py-16 text-center text-ink-secondary">
          <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-ink-primary">No se pudo cargar la información del hito.</p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto px-1 sm:px-4 py-2">
          {/* Hoja de papel A4 estilizada */}
          <div
            ref={printAreaRef}
            className="bg-white border border-border-soft rounded-lg p-6 sm:p-10 shadow-md text-ink-primary"
            style={{ minHeight: "297mm", maxWidth: "210mm", margin: "0 auto" }}
          >
            {/* Encabezado Institucional */}
            <div className="print-header flex items-center justify-between border-b-2 border-[#562599] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#562599] text-white flex items-center justify-center font-black text-lg">
                  Σ
                </div>
                <div>
                  <div className="print-logo text-xl font-black text-[#562599] tracking-tight">
                    SIGMA-T
                  </div>
                  <div className="print-sublogo text-[10px] text-ink-secondary uppercase font-bold tracking-wider">
                    Corte Superior de Justicia • Módulo de Familia
                  </div>
                </div>
              </div>

              <div className="print-meta text-right text-xs text-ink-secondary">
                <div className="font-semibold text-ink-primary">Constancia de Cumplimiento</div>
                <div>Folio: <span className="font-mono font-bold text-[#562599]">{correlativo}</span></div>
                <div className="text-[10px] text-ink-tertiary">Emisión: {fechaEmision}</div>
              </div>
            </div>

            {/* Banner de Título */}
            <div className="print-title-box text-center bg-[#562599]/5 border border-[#562599]/20 p-3.5 rounded-lg mb-6">
              <h2 className="print-title text-base sm:text-lg font-black text-[#562599] uppercase tracking-wide">
                CONSTANCIA DE ASISTENCIA Y CUMPLIMIENTO DE HITO
              </h2>
              <p className="print-subtitle text-xs text-ink-secondary mt-1">
                Documento de verificación emitido por el Sistema Integrado de Control de Asistencias
              </p>
            </div>

            {/* Bloque 1: Datos del Beneficiario */}
            <h3 className="section-title text-xs font-bold text-[#562599] border-b border-border-soft pb-1 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#562599]" />
              <span>1. Identificación del Beneficiario / Supervisado</span>
            </h3>
            <div className="grid-2 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs mb-5 bg-surface-muted/40 p-3.5 rounded-lg border border-border-soft">
              <div className="info-item">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase">Apellidos y Nombres:</span>
                <span className="info-value font-bold text-ink-primary text-sm">{persona?.nombre || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase">D.N.I. / Documento:</span>
                <span className="info-value font-mono font-bold text-ink-primary text-sm">{persona?.dni || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase">N° Expediente Judicial:</span>
                <span className="info-value font-mono font-semibold text-ink-primary">{persona?.expediente || "Sin expediente asignado"}</span>
              </div>
              <div className="info-item">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase">Juzgado de Origen:</span>
                <span className="info-value font-semibold text-ink-primary">{persona?.juzgado || "Juzgado de Familia"}</span>
              </div>
              <div className="info-item">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase">Teléfono de Contacto:</span>
                <span className="info-value text-ink-primary">{persona?.telefono || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase">Estado de Seguimiento:</span>
                <span className="info-value capitalize font-semibold text-emerald-800">{persona?.seguimiento || "En Proceso Activo"}</span>
              </div>
            </div>

            {/* Bloque 2: Datos del Hito y Resumen de Asistencias */}
            <h3 className="section-title text-xs font-bold text-[#562599] border-b border-border-soft pb-1 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#562599]" />
              <span>2. Resumen Ejecutivo del Hito Evaluado</span>
            </h3>
            <div className="grid-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-5">
              <div className="p-3 rounded-lg bg-surface-muted/40 border border-border-soft">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase block">Hito Procesal:</span>
                <span className="info-value font-bold text-ink-primary text-sm block mt-0.5">
                  {hito.nombre || hito.titulo || `Hito #${hito.id}`}
                </span>
                <span className="text-[11px] text-ink-secondary mt-1 block">
                  Fecha Límite: {hito.fecha ? hito.fecha.split("T")[0] : "—"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-muted/40 border border-border-soft">
                <span className="info-label text-[10px] text-ink-secondary font-bold uppercase block">Balance de Sesiones:</span>
                <div className="mt-1 space-y-0.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-secondary">Requeridas:</span>
                    <span className="font-bold">{total}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Asistidas:</span>
                    <span>{asistidas}</span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Inasistencias:</span>
                    <span className="font-bold">{faltas}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#562599]/5 border border-[#562599]/20 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] text-ink-secondary font-bold uppercase">Cumplimiento Global</span>
                <div className="text-2xl font-black text-[#562599] my-0.5">
                  {porcentaje}%
                </div>
                <div className="mt-1">
                  {isCumplido && isValida ? (
                    <span className="badge-box badge-success text-[10px] px-2 py-0.5 rounded font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Cumplido y Válido
                    </span>
                  ) : isCumplido ? (
                    <span className="badge-box badge-purple text-[10px] px-2 py-0.5 rounded font-extrabold bg-purple-100 text-[#562599] border border-purple-300">
                      100% Asistido
                    </span>
                  ) : (
                    <span className="badge-box badge-warning text-[10px] px-2 py-0.5 rounded font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                      En Proceso ({porcentaje}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bloque 3: Detalle de Sesiones */}
            <h3 className="section-title text-xs font-bold text-[#562599] border-b border-border-soft pb-1 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#562599]" />
                3. Cronograma y Marcación de Sesiones
              </span>
              <span className="text-[10px] text-ink-secondary font-normal lowercase">
                ({sesiones.length} sesión(es) registradas)
              </span>
            </h3>

            {sesiones.length === 0 ? (
              <div className="p-4 text-center text-xs text-ink-secondary bg-surface-muted/30 border border-border-soft rounded-lg mb-4">
                No existen fechas de sesiones agendadas para este hito.
              </div>
            ) : (
              <table className="w-full border-collapse text-xs mb-5">
                <thead>
                  <tr className="bg-surface-muted/80 text-ink-primary font-bold text-[10px] uppercase border-b border-border-soft">
                    <th className="p-2 border border-border-soft text-center w-12">N°</th>
                    <th className="p-2 border border-border-soft">Fecha</th>
                    <th className="p-2 border border-border-soft">Modalidad</th>
                    <th className="p-2 border border-border-soft text-center">Condición</th>
                    <th className="p-2 border border-border-soft">Observaciones / Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {sesiones.map((s, idx) => {
                    const asistio = Boolean(s.asistio);
                    const cleanDate = s.fecha ? s.fecha.split("T")[0] : "—";
                    return (
                      <tr key={s.id || idx} className="border-b border-border-soft">
                        <td className="p-2 border border-border-soft text-center font-bold font-mono">
                          {s.numero || idx + 1}
                        </td>
                        <td className="p-2 border border-border-soft font-medium">
                          {cleanDate}
                        </td>
                        <td className="p-2 border border-border-soft capitalize text-ink-secondary">
                          {s.tipo || "Presencial"}
                        </td>
                        <td className="p-2 border border-border-soft text-center">
                          {asistio ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Asistió
                            </span>
                          ) : s.programada ? (
                            <span className="inline-flex items-center gap-1 text-ink-secondary bg-surface-muted px-2 py-0.5 rounded text-[11px]">
                              <Clock className="w-3 h-3" />
                              Programada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Inasistencia
                            </span>
                          )}
                        </td>
                        <td className="p-2 border border-border-soft text-ink-secondary text-[11px]">
                          {s.notas || s.observacion || (asistio ? "Asistencia confirmada en sistema" : "—")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Bloque 4: Dictamen Institucional */}
            <div className="dictamen-box bg-purple-50/50 border-l-4 border-[#562599] p-3.5 rounded-r-lg mb-6 text-xs text-ink-primary leading-relaxed">
              <strong className="text-[#562599] block mb-1 uppercase text-[10px] tracking-wider">
                Dictamen Institucional de Control de Asistencia:
              </strong>
              Se hace constar formalmente que el/la ciudadano(a){" "}
              <strong>{persona?.nombre || "EL BENEFICIARIO"}</strong>, identificado(a) con DNI N°{" "}
              <strong>{persona?.dni || "—"}</strong>, registra a la fecha un nivel de cumplimiento del{" "}
              <strong>{porcentaje}%</strong> ({asistidas} de {total} sesiones requeridas) respecto a las obligaciones fijadas
              en el hito judicial de referencia, conforme a las constancias electrónicas que obran en la plataforma SIGMA-T.
            </div>

            {/* Bloque 5: Firmas y Sellos */}
            <div className="signatures-container grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-dashed border-border-soft">
              <div className="signature-box text-center">
                <div className="h-14 flex items-end justify-center">
                  <div className="w-48 border-b border-ink-secondary/60"></div>
                </div>
                <div className="signature-name text-xs font-bold text-ink-primary mt-2">
                  {persona?.nombre || "Firma del Beneficiario"}
                </div>
                <div className="signature-role text-[10px] text-ink-secondary uppercase">
                  DNI: {persona?.dni || "__________________"}
                </div>
                <div className="text-[10px] text-ink-tertiary">Beneficiario / Supervisado</div>
              </div>

              <div className="signature-box text-center">
                <div className="h-14 flex items-end justify-center">
                  <div className="w-48 border-b border-ink-secondary/60"></div>
                </div>
                <div className="signature-name text-xs font-bold text-ink-primary mt-2">
                  Especialista / Supervisor Legal
                </div>
                <div className="signature-role text-[10px] text-ink-secondary uppercase">
                  Módulo Integrado de Familia
                </div>
                <div className="text-[10px] text-ink-tertiary">Poder Judicial • Control SIGMA-T</div>
              </div>
            </div>

            {/* Pie de página oficial */}
            <div className="print-footer text-center text-[10px] text-ink-tertiary border-t border-border-soft pt-4 mt-8">
              Documento emitido electrónicamente por el Sistema SIGMA-T. La autenticidad e integridad de la presente constancia
              puede ser cotejada a través del expediente judicial y el registro biométrico de asistencias.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

