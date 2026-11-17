"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  MessageCircle,
  CheckCircle,
  Copy,
  Car,
  Truck,
  Bike,
  Sparkles,
  ShieldCheck,
  QrCode,
  DollarSign,
  Calendar,
  Clock,
  Phone,
  User,
  ExternalLink,
  Receipt,
  Share2,
  UserCheck,
} from "lucide-react";
import { formatCurrency } from "@/data/servicesData";
import { AdminBooking, createWhatsAppReceiptLink } from "@/data/adminStore";

interface CustomerReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: (AdminBooking | any) | null;
  onUpdateBooking?: (updated: AdminBooking) => void;
  canViewFinancials?: boolean;
}

export default function CustomerReceiptModal({
  isOpen,
  onClose,
  booking,
  onUpdateBooking,
  canViewFinancials = true,
}: CustomerReceiptModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>(
    booking?.paymentMethod || "efectivo"
  );
  const [isPaidState, setIsPaidState] = useState<boolean>(
    booking?.isPaid ?? false
  );

  // Sync state if booking changes
  React.useEffect(() => {
    if (booking) {
      setSelectedMethod(booking.paymentMethod || "efectivo");
      setIsPaidState(booking.isPaid ?? false);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleTogglePayment = (paid: boolean, method?: string) => {
    const newMethod = method || selectedMethod;
    setIsPaidState(paid);
    if (method) setSelectedMethod(method);

    if (onUpdateBooking && booking.id) {
      const updated: AdminBooking = {
        ...booking,
        isPaid: paid,
        paymentMethod: newMethod as any,
        updatedAt: new Date().toISOString(),
      };
      onUpdateBooking(updated);
    }
  };

  const getCleanPhone = (phoneStr?: string) => {
    const raw = (phoneStr || "").replace(/\D/g, "");
    return raw.length === 10 ? `57${raw}` : raw;
  };

  const shareReceiptWhatsApp = () => {
    const link = createWhatsAppReceiptLink(booking, !canViewFinancials);
    window.open(link, "_blank");
  };

  const copyReceiptText = () => {
    const financialSnippet = canViewFinancials
      ? `Estado: ${isPaidState ? "PAGADO" : "PENDIENTE"}\n` +
        `Método: ${selectedMethod.toUpperCase()}\n` +
        `Total: ${formatCurrency(booking.price || 0)}\n`
      : `Estado de Taller: ${booking.stage === 5 ? "ENTREGADO" : "EN SERVICIO"}\n`;

    const text = `🧾 *COMPROBANTE DE SERVICIO - EXCLUSIVE AUTOWASH*\n` +
      `-----------------------------------------\n` +
      `Orden N°: REC-${booking.code || "001"}\n` +
      `Cliente: ${booking.clientName || "Cliente"}\n` +
      `Placa: ${(booking.licensePlate || "").toUpperCase()}\n` +
      `Vehículo: ${(booking.vehicleType || "carro").toUpperCase()}\n` +
      `Servicio: ${booking.serviceName || "Lavado Premium"}\n` +
      `Bahía: ${booking.bay || "Bahía 1"}\n` +
      `Lavador / Detallador: ${booking.assignedEmployee || "Equipo Técnico Exclusive"}\n` +
      `Fecha: ${booking.day || "Hoy"} - ${booking.time || "10:00 AM"}\n` +
      financialSnippet +
      `-----------------------------------------\n` +
      `Seguimiento en vivo: https://exclusive-autowash.com?placa=${(booking.licensePlate || "").toUpperCase()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getVehicleIcon = () => {
    const vt = (booking.vehicleType || "carro").toLowerCase();
    if (vt === "moto") return <Bike className="w-4 h-4 text-slate-800" />;
    if (vt === "camioneta") return <Truck className="w-4 h-4 text-slate-800" />;
    return <Car className="w-4 h-4 text-slate-800" />;
  };

  const receiptDate = booking.day || "Hoy";
  const receiptTime = booking.time || "En curso";
  const trackingUrl = `https://exclusive-autowash.com?placa=${(booking.licensePlate || "").toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start">
      <div className="relative w-full max-w-lg my-4 flex flex-col items-center">
        
        {/* TOP BAR ACTIONS (Hide when printing) */}
        <div className="w-full flex items-center justify-between pb-3 text-white no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-sm font-bold tracking-wide">Comprobante de Servicio</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CARD */}
        <div
          id="printable-receipt"
          className="w-full bg-[#fdfdfd] text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden font-sans"
        >
          {/* Top Perforation / Tear Graphic Accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600" />

          {/* Watermark for Paid */}
          {isPaidState && (
            <div className="absolute right-4 top-20 pointer-events-none opacity-[0.14] rotate-[-18deg] select-none">
              <div className="border-4 border-emerald-600 text-emerald-800 font-black text-4xl px-4 py-1.5 rounded-xl uppercase tracking-widest">
                PAGADO
              </div>
            </div>
          )}

          {/* 1. STUDIO HEADER */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="flex justify-center mb-2">
              <div className="bg-black px-4 py-1.5 rounded-2xl border border-slate-800 shadow-md inline-flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="Exclusive Detallado de Vehículos"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            <h1 className="text-base font-black text-slate-950 uppercase tracking-tight">
              Exclusive Detallado de Vehículos
            </h1>
            <p className="text-[11px] text-slate-600 font-medium">
              Spa de Motos y Autos • Calidad, Rapidez y Estilo
            </p>
            <p className="text-[10px] text-slate-500">
              Calle 28 #74A-10 Belén Granadas • Tel: +57 323 311 8393
            </p>
          </div>

          {/* 2. RECEIPT METADATA (Code, Date, Bay) */}
          <div className="py-3.5 border-b border-dashed border-slate-300 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Comprobante N°</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                REC-{booking.code || "001"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Fecha & Hora</span>
              <span className="font-medium text-slate-800">
                {receiptDate} • {receiptTime}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Bahía de Atención</span>
              <span className="font-semibold text-slate-800">{booking.bay || "Bahía Principal"}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Modalidad</span>
              <span className="font-semibold text-slate-800">
                {booking.isWalkIn ? "Recepción Inmediata" : "Reserva Online"}
              </span>
            </div>
          </div>

          {/* 3. CUSTOMER & VEHICLE BOX */}
          <div className="py-3.5 border-b border-dashed border-slate-300">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Cliente</span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{booking.clientName || "Cliente Particular"}</span>
                </p>
                <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{booking.clientPhone || "Sin teléfono"}</span>
                </p>
              </div>

              {/* License Plate Badge */}
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">
                  Placa Vehículo
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ffd100] text-slate-950 font-mono font-black text-sm border-2 border-slate-900 shadow-sm">
                  {getVehicleIcon()}
                  <span>{(booking.licensePlate || "").toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Operario Asignado */}
            <div className="mt-2.5 flex items-center justify-between px-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                Operario / Lavador Asignado:
              </span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {booking.assignedEmployee || "Equipo Técnico Exclusive"}
              </span>
            </div>
          </div>

          {/* 4. ITEMS & SERVICES BREAKDOWN */}
          <div className="py-3.5 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase pb-1.5">
              <span>Descripción del Servicio</span>
              {canViewFinancials && <span>Importe</span>}
            </div>

            <div className="flex justify-between items-start py-2">
              <div className="pr-4">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {booking.serviceName || "Lavado & Detailing"}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  Vehículo: {booking.vehicleType || "Automóvil"} • Tratamiento Especializado
                </p>
                {booking.clientNotes && (
                  <p className="text-[10px] text-slate-500 italic mt-0.5">
                    Obs: "{booking.clientNotes}"
                  </p>
                )}
              </div>
              {canViewFinancials && (
                <div className="text-right font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(booking.price || 0)}
                </div>
              )}
            </div>
          </div>

          {/* 5. TOTALS & FINANCIAL SUMMARY */}
          {canViewFinancials ? (
            <div className="py-3.5 border-b border-dashed border-slate-300 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">
                  {formatCurrency(booking.originalPrice || booking.price || 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  Descuentos{booking.discountPercent ? ` (Bono ${booking.discountPercent}% OFF)` : ""}:
                </span>
                <span className={`font-mono ${booking.discountPercent ? "text-emerald-700 font-bold" : ""}`}>
                  {booking.discountPercent && booking.originalPrice
                    ? `-${formatCurrency(booking.originalPrice - booking.price)}`
                    : "$ 0"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA / Impuestos (Incluido):</span>
                <span className="font-mono">$ 0</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-base font-black text-slate-950">
                <span>TOTAL A CANCELAR:</span>
                <span className="text-lg font-mono text-cyan-700">
                  {formatCurrency(booking.price || 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-3.5 border-b border-dashed border-slate-300 space-y-1 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 my-2">
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Bahía de Atención:</span>
                <span className="font-bold text-slate-950">{booking.bay || "Bahía 1 (Lavado)"}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Turno Registrado:</span>
                <span className="font-bold text-slate-950">{booking.time || "En curso"}</span>
              </div>
            </div>
          )}

          {/* 6. PAYMENT STATUS & METHOD BADGE */}
          {canViewFinancials ? (
            <div className="py-3.5 border-b border-dashed border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  Método de Pago
                </span>
                <span className="font-bold text-slate-900 uppercase text-xs">
                  {selectedMethod}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">
                  Estado de Cuenta
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                    isPaidState
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isPaidState ? "PAGADO" : "PENDIENTE DE PAGO"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3.5 border-b border-dashed border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  Control Operativo
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  Orden de Trabajo de Taller
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">
                  Estado Actual
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-cyan-100 text-cyan-800 border border-cyan-300">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{booking.stage === 5 ? "ENTREGADO" : "EN SERVICIO"}</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. DIGITAL LIVE TRACKING QR LINK */}
          <div className="py-3.5 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 my-3">
            <div className="w-12 h-12 bg-white rounded-lg p-1 border border-slate-300 flex items-center justify-center shrink-0 shadow-sm">
              <QrCode className="w-10 h-10 text-slate-900" />
            </div>
            <div className="text-[10px] text-slate-600 leading-tight">
              <p className="font-bold text-slate-900 text-[11px] mb-0.5">
                Rastreo de Turno en Tiempo Real
              </p>
              <p>
                Escanea o ingresa tu placa en nuestro portal para consultar el avance técnico y estado de entrega de tu vehículo.
              </p>
              <span className="font-mono text-[9px] text-cyan-700 underline truncate block mt-0.5">
                exclusive-autowash.com?placa={(booking.licensePlate || "").toUpperCase()}
              </span>
            </div>
          </div>

          {/* 8. FOOTER POLICIES & BARCODE */}
          <div className="pt-2 text-center text-[10px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              Garantía de satisfacción: 24 horas ante lluvia o inconformidad.
            </p>
            <p>
              Por favor retirar objetos de valor del habitáculo. No nos hacemos responsables por pérdidas no declaradas.
            </p>
            <p className="font-bold text-slate-800 text-[11px] pt-1">
              ¡Gracias por preferir Exclusive AutoWash & Detailing Studio!
            </p>

            {/* Decorative Barcode */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="h-7 w-48 flex items-stretch gap-[2px] opacity-75">
                {[2, 1, 3, 1, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{ width: `${w}px` }}
                    />
                  )
                )}
              </div>
              <span className="font-mono text-[9px] text-slate-400 mt-1">
                *REC-{(booking.code || "001").toUpperCase()}-{(booking.licensePlate || "EXC").toUpperCase()}*
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS (Hide when printing) */}
        <div className="w-full mt-4 space-y-3 no-print">
          
          {/* Quick Admin Payment Control (if onUpdateBooking is provided & role has financial access) */}
          {onUpdateBooking && canViewFinancials && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">Control de Pago en Caja:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Method selector */}
                <select
                  value={selectedMethod}
                  onChange={(e) => handleTogglePayment(isPaidState, e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 text-white text-[11px] font-bold focus:outline-none focus:border-cyan-400"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleTogglePayment(!isPaidState)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                    isPaidState
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>{isPaidState ? "Marcar Pendiente" : "Marcar Pagado"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Grid: Print, WhatsApp, Copy, Close */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={shareReceiptWhatsApp}
              className="py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba59] text-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Enviar WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={copyReceiptText}
              className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Datos</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-transparent hover:bg-white/5 transition-colors text-center"
          >
            Cerrar Comprobante
          </button>
        </div>

      </div>
    </div>
  );
}
