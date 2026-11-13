"use client";

import React, { useState } from "react";
import { VehicleType, SERVICES_LIST, formatCurrency } from "@/data/servicesData";
import {
  AdminBooking,
  saveNewBooking,
  DEFAULT_EMPLOYEES,
  getPromoEnabled,
  hasPlateUsedPromo,
  normalizePlate,
} from "@/data/adminStore";
import {
  X,
  PlusCircle,
  Car,
  Truck,
  Bike,
  User,
  Phone,
  Tag,
  CheckCircle,
  AlertCircle,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  Layers,
  UserCheck,
  Calendar,
  Clock,
} from "lucide-react";

interface ExpressWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: (booking: AdminBooking) => void;
  canViewFinancials?: boolean;
}

export default function ExpressWalkInModal({
  isOpen,
  onClose,
  onBookingCreated,
  canViewFinancials = true,
}: ExpressWalkInModalProps) {
  const [entryMode, setEntryMode] = useState<"walkin" | "scheduled">("walkin");
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customTime, setCustomTime] = useState("10:00 AM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("carro");
  const [selectedServiceId, setSelectedServiceId] = useState("lavada-full");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [bay, setBay] = useState("Bahía 1 (Lavado)");
  const [assignedEmployee, setAssignedEmployee] = useState(DEFAULT_EMPLOYEES[0] || "Carlos Moreno");
  const [stage, setStage] = useState<1 | 2>(2); // 2: In wash immediately by default
  const [paymentMethod, setPaymentMethod] = useState<AdminBooking["paymentMethod"]>("pendiente");
  const [isPaid, setIsPaid] = useState(false);
  const [clientNotes, setClientNotes] = useState("");
  const [applyPromo, setApplyPromo] = useState(true);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isPromoGlobalEnabled = getPromoEnabled();
  const cleanAlphaPlate = normalizePlate(licensePlate);
  const isPlateReady = cleanAlphaPlate.length >= 5;
  const promoCheck = isPlateReady
    ? hasPlateUsedPromo(licensePlate)
    : { used: false, previousBooking: undefined };

  const availableServices = SERVICES_LIST.filter(
    (s) => s.prices[vehicleType] > 0
  );
  const activeService =
    availableServices.find((s) => s.id === selectedServiceId) ||
    availableServices[0];
  const basePrice = activeService ? activeService.prices[vehicleType] : 0;
  const canApplyPromo =
    isPromoGlobalEnabled && isPlateReady && !promoCheck.used && applyPromo;
  const discountAmount = canApplyPromo ? Math.round(basePrice * 0.15) : 0;
  const price = Math.max(0, basePrice - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!licensePlate.trim()) {
      setError("Por favor ingresa la placa del vehículo.");
      return;
    }

    if (!clientName.trim()) {
      setError("Por favor ingresa el nombre del cliente.");
      return;
    }

    const cleanPlate = licensePlate.trim().toUpperCase();
    const latestPromoCheck = hasPlateUsedPromo(cleanPlate);
    const applyPromoNow =
      isPromoGlobalEnabled && !latestPromoCheck.used && applyPromo;
    const finalDiscount = applyPromoNow ? Math.round(basePrice * 0.15) : 0;
    const finalPrice = Math.max(0, basePrice - finalDiscount);

    const isWalkIn = entryMode === "walkin";
    const appointmentDate = isWalkIn ? new Date().toISOString().slice(0, 10) : customDate;
    const timeValue = isWalkIn
      ? new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : customTime;
    const dayLabel = isWalkIn ? "Hoy" : customDate;

    setIsSubmitting(true);

    try {
      const created = saveNewBooking({
        licensePlate: cleanPlate,
        vehicleType,
        serviceId: activeService.id,
        serviceName: activeService.name,
        originalPrice: basePrice,
        discountPercent: applyPromoNow ? 15 : 0,
        promoCode: applyPromoNow ? "INAUGURACION15" : "",
        price: finalPrice,
        day: dayLabel,
        appointmentDate,
        time: timeValue,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || "No registrado",
        clientNotes: applyPromoNow
          ? `${clientNotes.trim() ? clientNotes.trim() + " • " : ""}[Bono Inauguración 15% OFF]`
          : clientNotes.trim() || undefined,
        isWalkIn,
        bay,
        stage: isWalkIn ? stage : 1,
        paymentMethod,
        isPaid,
        assignedEmployee: assignedEmployee.trim() || undefined,
      });

      onBookingCreated(created);
      onClose();

      // Reset form
      setLicensePlate("");
      setClientName("");
      setClientPhone("");
      setClientNotes("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c1019] border border-white/10 p-4 sm:p-7 md:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                Recepción Rápida • Vehículo sin Cita
              </h3>
              <p className="text-xs text-slate-400">
                Registra un cliente presencial en menos de 15 segundos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Selector de Modo: Ingreso Inmediato vs Agendar Cita */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/10">
          <button
            type="button"
            onClick={() => {
              setEntryMode("walkin");
              setStage(2);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              entryMode === "walkin"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Vehículo en Taller (Ahora)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEntryMode("scheduled");
              setStage(1);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              entryMode === "scheduled"
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Cita Previa</span>
          </button>
        </div>

        {entryMode === "scheduled" && (
          <div className="mt-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            <div>
              <label className="text-xs uppercase font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Fecha de la Cita *
              </label>
              <input
                type="date"
                required
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs uppercase font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                Hora de la Cita *
              </label>
              <input
                type="text"
                placeholder="Ej: 10:00 AM, 02:30 PM"
                required
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* 1. Placa y Tipo de Vehículo */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
                Placa del Vehículo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: ABC-123"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-lg font-black tracking-widest uppercase focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* Validador en tiempo real del Bono 15% OFF por Placa */}
              {isPromoGlobalEnabled && isPlateReady && (
                <div className="mt-2">
                  {promoCheck.used ? (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Bono 15% ya usado:</strong> Esta placa ya redimió su descuento único{promoCheck.previousBooking?.code ? ` (${promoCheck.previousBooking.code})` : ""}.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Bono 15% OFF Disponible</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setApplyPromo(!applyPromo)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                          applyPromo
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {applyPromo ? "Aplicado ✓" : "Aplicar 15%"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sm:col-span-6">
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
                Tipo de Vehículo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "carro" as VehicleType, label: "Auto", icon: Car },
                  { id: "camioneta" as VehicleType, label: "SUV", icon: Truck },
                  { id: "moto" as VehicleType, label: "Moto", icon: Bike },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = vehicleType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setVehicleType(item.id);
                        if (item.id === "moto") setBay("Bahía 3 (Motos)");
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Servicio Seleccionado */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
              Servicio de Lavado / Detailing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableServices.map((s) => {
                const isSelected = s.id === selectedServiceId;
                const cost = s.prices[vehicleType];
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-500/15 border-cyan-400 text-white font-bold"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.durationMinutes} min</p>
                    </div>
                    {canViewFinancials ? (
                      <span className="text-xs font-black text-cyan-400">
                        {formatCurrency(cost)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
                        Seleccionar
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Datos del Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
                Nombre del Cliente *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellido"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
                WhatsApp del Cliente
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="Ej: 312 456 7890"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* 4. Asignación de Bahía, Lavador/Operario & Estado Inicial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
                Bahía
              </label>
              <select
                value={bay}
                onChange={(e) => setBay(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="Bahía 1 (Lavado)">Bahía 1 (Lavado)</option>
                <option value="Bahía 2 (Secado/Detallado)">Bahía 2 (Secado/Detallado)</option>
                <option value="Bahía 3 (Motos)">Bahía 3 (Motos)</option>
                <option value="En Espera / Cola">En Espera / Cola</option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                Lavador / Operario
              </label>
              <input
                type="text"
                list="employee-suggestions"
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
                placeholder="Nombre del operario"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
              />
              <datalist id="employee-suggestions">
                {DEFAULT_EMPLOYEES.map((emp) => (
                  <option key={emp} value={emp} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1.5">
                Estado Inicial
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(Number(e.target.value) as 1 | 2)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value={2}>🚿 Entra a Lavado</option>
                <option value={1}>⏳ En Cola / Espera</option>
              </select>
            </div>
          </div>

          {/* 5. Método de Pago & Estado de Pago (Solo Admin) */}
          {canViewFinancials && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Método de Pago:</span>
                <div className="flex items-center gap-1">
                  {(["efectivo", "nequi", "daviplata", "tarjeta", "pendiente"] as const).map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`px-2 py-1 rounded-lg text-[10px] uppercase font-bold transition-all ${
                          paymentMethod === m
                            ? "bg-cyan-500 text-slate-950 font-black"
                            : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    )
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-black/50 border-white/20"
                />
                <span className="text-xs font-bold text-white">¿Ya Canceló el Servicio?</span>
              </label>
            </div>
          )}

          {/* 6. Observaciones */}
          <div>
            <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
              Observaciones del Vehículo (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Rayón previo en puerta derecha, dejar tapetes en baúl..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Summary & Submit */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between sm:block">
              {canViewFinancials ? (
                <>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Total a Cobrar {canApplyPromo ? "(Con 15% OFF)" : ""}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                      {formatCurrency(price)}
                    </p>
                    {canApplyPromo && (
                      <span className="text-xs text-slate-500 line-through font-mono">
                        {formatCurrency(basePrice)}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Servicio Asignado</span>
                  <p className="text-sm sm:text-base font-bold text-cyan-400">{activeService.name}</p>
                </>
              )}
            </div>

            {/* Action buttons: mobile 2-column grid, desktop flex */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto py-3 sm:py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/20 border border-white/10 text-center flex items-center justify-center transition-all cursor-pointer active:scale-95 touch-manipulation"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto py-3 sm:py-2.5 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Ingresar a Bahía</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
