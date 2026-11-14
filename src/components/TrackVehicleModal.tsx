"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { 
  Search, X, CheckCircle2, Clock, ShieldCheck, Car, Sparkles, 
  AlertCircle, Receipt, RefreshCw, MessageCircle, Check, ArrowRight,
  Video, Maximize2, Activity, UserCheck, Wrench, Calendar, MapPin,
  CalendarClock, Trash2, Lock, PhoneCall
} from "lucide-react";
import CustomerReceiptModal from "./admin/CustomerReceiptModal";
import { BUSINESS_CONFIG, formatCurrency } from "@/data/servicesData";
import {
  getColombiaNow,
  time12hToMinutes,
  getSlotsForDate,
  getSlotCapacity,
  getStoredBookings,
  getAppointmentModifyEligibility,
  rescheduleBooking,
  deleteBooking,
} from "@/data/adminStore";

interface TrackVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTuneMainCamera?: (booking: any) => void;
  initialPlate?: string;
}

const STAGES_LIST = [
  { id: 1, title: "1. Recepción & Verificación", desc: "Vehículo recibido, inspección inicial y turno asignado." },
  { id: 2, title: "2. Bahía de Lavado", desc: "Desengrase técnico, espuma activa Snow Foam pH neutro y lavado exterior." },
  { id: 3, title: "3. Detallado & Secado", desc: "Secado técnico en microfibra, aspirado profundo y cuidado de cabina." },
  { id: 4, title: "4. ¡Listo para Retiro!", desc: "Control de calidad final aprobado. Listo para entrega al cliente." },
  { id: 5, title: "5. Entregado & Finalizado", desc: "Servicio culminado satisfactoriamente y vehículo entregado." },
];

export default function TrackVehicleModal({ 
  isOpen, 
  onClose, 
  onTuneMainCamera, 
  initialPlate 
}: TrackVehicleModalProps) {
  const [plateQuery, setPlateQuery] = useState(initialPlate || "");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(Boolean(initialPlate));
  const [isLoading, setIsLoading] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const activePlateRef = useRef<string>(initialPlate || "");

  // Appointment Management State (Reschedule / Cancel >= 1h before)
  const [manageAction, setManageAction] = useState<"none" | "reschedule" | "cancel">("none");
  const [verifyInput, setVerifyInput] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");
  const [cancelledBookingInfo, setCancelledBookingInfo] = useState<{
    plate: string;
    day: string;
    time: string;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Reschedule Date & Time Picker State
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [slotCapacity, setSlotCapacityState] = useState<number>(1);
  const [colombiaTime, setColombiaTime] = useState<{ totalMinutes: number; isoDate: string }>({
    totalMinutes: 0,
    isoDate: "",
  });
  const [rescheduleDays, setRescheduleDays] = useState<
    Array<{
      index: number;
      dayName: string;
      dateNumber: number;
      month: string;
      fullDateString: string;
      isoDate: string;
    }>
  >([]);
  const [selectedRescheduleDayIdx, setSelectedRescheduleDayIdx] = useState<number>(0);
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState<string>("");

  // Normalize string for fuzzy matching (removes hyphens, spaces, special chars, uppercase)
  const cleanPlateStr = (str: string) => (str || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

  // Hydrate Colombia clock and 14-day reschedule calendar when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const updateClockAndDays = () => {
      const colNow = getColombiaNow();
      setColombiaTime({ totalMinutes: colNow.totalMinutes, isoDate: colNow.isoDate });

      const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const [yT, mT, dT] = colNow.isoDate.split("-").map(Number);

      const days = Array.from({ length: 14 }).map((_, index) => {
        const date = new Date(yT, mT - 1, dT + index);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return {
          index,
          dayName: index === 0 ? "Hoy" : index === 1 ? "Mañana" : dayNames[date.getDay()],
          dateNumber: date.getDate(),
          month: monthNames[date.getMonth()],
          fullDateString: `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}`,
          isoDate: `${y}-${m}-${d}`,
        };
      });
      setRescheduleDays(days);
      setSlotCapacityState(getSlotCapacity());
      try {
        const blocked = JSON.parse(localStorage.getItem("exclusive_blocked_slots") || "[]");
        setBlockedSlots(blocked);
      } catch {}
    };

    updateClockAndDays();
    const timer = setInterval(updateClockAndDays, 10000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Real-time lookup logic: checks API first, then falls back to localStorage
  const fetchVehicleStatus = useCallback(async (plate: string, isBackground = false) => {
    const clean = cleanPlateStr(plate);
    if (!clean) return;

    if (!isBackground) setIsLoading(true);

    try {
      let matchedBooking: any = null;
      let latestList: any[] = [];

      // 1. Try real-time API fetch
      try {
        const res = await fetch("/api/bookings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.bookings && Array.isArray(data.bookings)) {
            latestList = data.bookings;
            const matches = data.bookings.filter((b: any) => 
              cleanPlateStr(b.licensePlate) === clean || cleanPlateStr(b.code) === clean
            );
            // Prioritize active bookings (stage < 5) first
            matchedBooking = matches.find((b: any) => Number(b.stage) < 5) || matches[0] || null;
          }
        }
      } catch (apiErr) {
        // Network/API fallback
      }

      // 2. If not found in API, check local storage
      if (!matchedBooking && typeof window !== "undefined") {
        try {
          const stored = JSON.parse(localStorage.getItem("exclusive_bookings") || "[]");
          if (Array.isArray(stored)) {
            if (latestList.length === 0) latestList = stored;
            const matches = stored.filter((b: any) => 
              cleanPlateStr(b.licensePlate) === clean || cleanPlateStr(b.code) === clean
            );
            matchedBooking = matches.find((b: any) => Number(b.stage) < 5) || matches[0] || null;
          }
        } catch (lsErr) {}
      }

      if (latestList.length > 0) {
        setAllBookings(latestList);
      } else {
        setAllBookings(getStoredBookings());
      }

      if (matchedBooking) {
        const stageNum = Number(matchedBooking.stage) || 1;
        setSearchResult({
          ...matchedBooking,
          stage: stageNum,
          stageName: matchedBooking.stageName || STAGES_LIST.find((s) => s.id === stageNum)?.title || "En Proceso",
          bay: matchedBooking.bay || "Bahía en Asignación",
        });
      } else {
        setSearchResult(null);
      }

      setLastRefreshed(
        new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    } catch (err) {
      console.error("Error consultando estado:", err);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateQuery.trim()) return;

    setHasSearched(true);
    setManageAction("none");
    setActionError("");
    setActionSuccess("");
    setCancelledBookingInfo(null);
    setVerifyInput("");
    activePlateRef.current = plateQuery.trim();
    await fetchVehicleStatus(plateQuery.trim(), false);
  };

  // Live Auto-Polling every 6 seconds while modal is open and has an active search
  useEffect(() => {
    if (!isOpen || !hasSearched || !activePlateRef.current || manageAction !== "none") return;

    const interval = setInterval(() => {
      fetchVehicleStatus(activePlateRef.current, true);
    }, 6000);

    return () => clearInterval(interval);
  }, [isOpen, hasSearched, manageAction, fetchVehicleStatus]);

  // Verify customer identity via last 4 digits of registered phone OR booking code EXC-XXXXXX
  const verifyCustomerIdentity = (): boolean => {
    if (!searchResult) return false;
    const raw = verifyInput.trim().toUpperCase();
    if (!raw) return false;

    if (searchResult.code && cleanPlateStr(raw) === cleanPlateStr(searchResult.code)) {
      return true;
    }

    const phoneDigits = String(searchResult.clientPhone || "").replace(/\D/g, "");
    const inputDigits = raw.replace(/\D/g, "");
    if (phoneDigits.length >= 4 && inputDigits.length === 4) {
      return phoneDigits.slice(-4) === inputDigits;
    }
    if (phoneDigits.length > 0 && inputDigits === phoneDigits) {
      return true;
    }
    return false;
  };

  // Open Reschedule or Cancel drawer
  const openManageDrawer = (mode: "reschedule" | "cancel") => {
    setActionError("");
    setActionSuccess("");
    setManageAction(mode);
    setSelectedRescheduleTime("");

    // If user searched directly using their secret code EXC-XXXXXX, prefill verification
    if (searchResult?.code && cleanPlateStr(plateQuery) === cleanPlateStr(searchResult.code)) {
      setVerifyInput(searchResult.code);
    } else {
      setVerifyInput("");
    }

    if (mode === "reschedule" && rescheduleDays.length > 0) {
      // Check if today still has any future slots; if not, default to tomorrow (index 1)
      const todayIso = rescheduleDays[0]?.isoDate || colombiaTime.isoDate;
      const todaySlots = getSlotsForDate(todayIso).filter(
        (s) => time12hToMinutes(s.time) > colombiaTime.totalMinutes
      );
      setSelectedRescheduleDayIdx(todaySlots.length > 0 ? 0 : Math.min(1, rescheduleDays.length - 1));
    }
  };

  // Confirm Cancel Appointment
  const handleConfirmCancel = async () => {
    if (!searchResult) return;
    setActionError("");

    const eligibility = getAppointmentModifyEligibility(searchResult);
    if (!eligibility.canModify) {
      setActionError(
        `El tiempo límite de 1 hora antes (${eligibility.deadlineTimeStr}) ya venció. Por favor escríbenos por WhatsApp.`
      );
      return;
    }

    if (!verifyCustomerIdentity()) {
      setActionError(
        "Los últimos 4 dígitos del teléfono (o el código EXC) no coinciden con los registrados en esta reserva."
      );
      return;
    }

    setIsProcessingAction(true);
    try {
      const info = {
        plate: searchResult.licensePlate,
        day: searchResult.day || "Hoy",
        time: searchResult.time || "",
      };
      deleteBooking(searchResult.id, searchResult.code);
      setCancelledBookingInfo(info);
      setSearchResult(null);
      setManageAction("none");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Confirm Reschedule Appointment
  const handleConfirmReschedule = async () => {
    if (!searchResult) return;
    setActionError("");

    const eligibility = getAppointmentModifyEligibility(searchResult);
    if (!eligibility.canModify) {
      setActionError(
        `El tiempo límite de 1 hora antes (${eligibility.deadlineTimeStr}) ya venció. Por favor escríbenos por WhatsApp.`
      );
      return;
    }

    const targetDay = rescheduleDays[selectedRescheduleDayIdx];
    if (!targetDay || !selectedRescheduleTime) {
      setActionError("Por favor selecciona el nuevo día y una hora disponible.");
      return;
    }

    // Check if new slot is in the past for today
    const isTargetToday =
      selectedRescheduleDayIdx === 0 || targetDay.isoDate === colombiaTime.isoDate;
    if (isTargetToday && time12hToMinutes(selectedRescheduleTime) <= colombiaTime.totalMinutes) {
      setActionError("La hora seleccionada ya transcurrió hoy. Elige una hora posterior.");
      return;
    }

    if (
      (searchResult.appointmentDate === targetDay.isoDate ||
        searchResult.day === targetDay.fullDateString) &&
      searchResult.time === selectedRescheduleTime
    ) {
      setActionError("Selecciona una fecha u hora distinta a la que ya tienes agendada.");
      return;
    }

    if (!verifyCustomerIdentity()) {
      setActionError(
        "Los últimos 4 dígitos del teléfono (o el código EXC) no coinciden con los registrados en esta reserva."
      );
      return;
    }

    setIsProcessingAction(true);
    try {
      await rescheduleBooking(
        searchResult.id,
        searchResult.code,
        targetDay.isoDate,
        targetDay.fullDateString,
        selectedRescheduleTime
      );

      setSearchResult((prev: any) =>
        prev
          ? {
              ...prev,
              day: targetDay.fullDateString,
              appointmentDate: targetDay.isoDate,
              time: selectedRescheduleTime,
            }
          : prev
      );
      setActionSuccess(
        `¡Cita reprogramada con éxito para el ${targetDay.fullDateString} a las ${selectedRescheduleTime}!`
      );
      setManageAction("none");
      await fetchVehicleStatus(activePlateRef.current || searchResult.licensePlate, true);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Compute visible reschedule slots for the selected target day
  const targetRescheduleDay = rescheduleDays[selectedRescheduleDayIdx];
  const isRescheduleTargetToday =
    selectedRescheduleDayIdx === 0 || targetRescheduleDay?.isoDate === colombiaTime.isoDate;
  const rescheduleVisibleSlots = React.useMemo(() => {
    if (!targetRescheduleDay) return [];
    const rawSlots = getSlotsForDate(targetRescheduleDay.isoDate);
    return rawSlots.filter((s) => {
      if (!isRescheduleTargetToday) return true;
      return time12hToMinutes(s.time) > colombiaTime.totalMinutes;
    });
  }, [targetRescheduleDay, isRescheduleTargetToday, colombiaTime.totalMinutes]);

  const modifyEligibility = searchResult
    ? getAppointmentModifyEligibility(searchResult)
    : { canModify: false, minutesRemaining: 0, deadlineTimeStr: "--:--", isPast: true };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl bg-[#090d16] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10 pr-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">Estado de tu Vehículo</h3>
              <p className="text-xs text-slate-400">Consulta en vivo el avance de tu auto o moto</p>
            </div>
          </div>
          <Image
            src="/images/logo.png"
            alt="Exclusive Logo"
            width={120}
            height={34}
            className="h-7 w-auto object-contain hidden sm:block opacity-90"
          />
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                maxLength={8}
                placeholder="Placa (ej: RLW098 o KLS-892)"
                value={plateQuery}
                onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
                className="w-full bg-black/60 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono uppercase text-white placeholder:text-slate-500 focus:outline-none tracking-widest transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 active:scale-95 font-black text-xs uppercase tracking-wider text-slate-950 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                "Consultar"
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 ml-1">
            Puedes buscar por placa o por código de reserva (ej: EXC-2083).
          </p>
        </form>

        {/* Loading Spinner State */}
        {isLoading && (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Consultando datos en tiempo real en los servidores de Exclusive...</span>
          </div>
        )}

        {/* Search Results Display */}
        {!isLoading && hasSearched && searchResult && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
            {/* Live Indicator Strip */}
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                ESTADO EN VIVO
              </span>
              {lastRefreshed && (
                <span className="text-slate-500 font-mono text-[10px]">
                  Actualizado: {lastRefreshed}
                </span>
              )}
            </div>

            {/* Vehicle Card Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Placa Registrada</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-2xl font-mono font-black text-cyan-400 tracking-wider">
                    {searchResult.licensePlate}
                  </span>
                  {searchResult.code && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                      {searchResult.code}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  <strong>Servicio:</strong> {searchResult.serviceName || "Lavado & Spa"}
                </div>
                {searchResult.clientName && (
                  <div className="text-[11px] text-slate-400">
                    Cliente: <span className="text-slate-200">{searchResult.clientName}</span>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Ubicación / Bahía</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/40 shadow-sm">
                  {searchResult.bay || "Bahía Principal"}
                </span>
                <span className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                  searchResult.isPaid 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {searchResult.isPaid ? "Pago Confirmado ✓" : "Pago Pendiente en Caja"}
                </span>
              </div>
            </div>

            {/*
              ============================================================
              [MÓDULO CÁMARAS EN VIVO - CCTV TEMPORALMENTE DESACTIVADO]
              Descomentar el siguiente bloque cuando las cámaras IP de las bahías estén conectadas
              ============================================================
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-xl relative group">
                <div className="p-3 bg-black/60 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-cyan-400" />
                      Cámara de Bahía en Vivo
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {searchResult.bay || "Bahía 1 (Lavado)"}
                  </span>
                </div>
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <video
                    src={
                      searchResult.vehicleType === "moto"
                        ? "/videos/wash_moto.mp4?v=2"
                        : searchResult.vehicleType === "camioneta"
                        ? "/videos/wash_camioneta.mp4?v=2"
                        : "/videos/wash_carro.mp4?v=2"
                    }
                    poster={
                      searchResult.vehicleType === "moto"
                        ? "/images/wash_moto.jpg"
                        : searchResult.vehicleType === "camioneta"
                        ? "/images/wash_camioneta.jpg"
                        : "/images/wash_carro.jpg"
                    }
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <div className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-red-400 border border-red-500/30 flex items-center gap-1.5 shadow">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      REC • {searchResult.licensePlate}
                    </div>
                    <div className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300 border border-white/15 shadow">
                      {searchResult.stageName}
                    </div>
                  </div>
                </div>
              </div>
            */}

            {/* VISTA ORGANIZADA: FICHA TÉCNICA Y MONITOREO DE BAHÍA */}
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0c1424] via-[#090d16] to-black border border-cyan-500/30 shadow-2xl p-4 sm:p-5 relative">
              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3.5 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase">
                      Monitoreo Técnico de Bahía
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Supervisión de proceso en tiempo real
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Bahía Activa
                </span>
              </div>

              {/* Technical details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3.5 relative z-10">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Ubicación</span>
                    <p className="text-xs font-bold text-white truncate">{searchResult.bay || "Bahía 1 (Lavado)"}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Operario a Cargo</span>
                    <p className="text-xs font-bold text-cyan-300 truncate">
                      {searchResult.assignedEmployee || "Equipo Técnico Exclusive"}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">Turno</span>
                    <p className="text-xs font-bold text-white truncate">
                      {searchResult.day || "Hoy"} • {searchResult.time || "En curso"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Active Stage Highlight Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-900/60 border border-cyan-500/30 text-xs text-white flex items-start gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-cyan-400/20">
                  {searchResult.stage}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-cyan-300 uppercase tracking-wide">
                      {searchResult.stageName}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/80">
                      Paso {searchResult.stage} de 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {STAGES_LIST.find((s) => s.id === searchResult.stage)?.desc ||
                      "Trabajo técnico especializado en ejecución."}
                  </p>
                </div>
              </div>

              {/* Quality Protocol note */}
              <p className="text-[10px] text-slate-500 mt-2.5 text-center relative z-10">
                Protocolo sin fricción • Química pH Neutro • Microfibras de 600 GSM
              </p>
            </div>

            {/* Success notification after rescheduling */}
            {actionSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="font-semibold">{actionSuccess}</span>
              </div>
            )}

            {/* APPOINTMENT MANAGEMENT CARD (Only when in Stage 1: Waiting/Reception and not a walk-in) */}
            {searchResult.stage === 1 && !searchResult.isWalkIn && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                      <CalendarClock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        ¿No puedes asistir a esta hora?
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Reprograma o cancela hasta <strong className="text-slate-200">1 hora antes</strong> de tu turno ({modifyEligibility.deadlineTimeStr})
                      </p>
                    </div>
                  </div>
                </div>

                {modifyEligibility.canModify ? (
                  <>
                    {/* Action Trigger Buttons */}
                    {manageAction === "none" && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => openManageDrawer("reschedule")}
                          className="py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span>Reprogramar Cita</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openManageDrawer("cancel")}
                          className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancelar Cita</span>
                        </button>
                      </div>
                    )}

                    {/* RESCHEDULE DRAWER */}
                    {manageAction === "reschedule" && (
                      <div className="pt-2 border-t border-white/10 space-y-3.5 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                            1. Elige el Nuevo Día
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setManageAction("none");
                              setActionError("");
                            }}
                            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Volver
                          </button>
                        </div>

                        {/* Day selector carousel */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                          {rescheduleDays.map((d) => (
                            <button
                              key={d.index}
                              type="button"
                              onClick={() => {
                                setSelectedRescheduleDayIdx(d.index);
                                setSelectedRescheduleTime("");
                              }}
                              className={`min-w-[66px] py-2 px-1.5 rounded-xl border text-center transition-all shrink-0 flex flex-col items-center gap-0.5 cursor-pointer ${
                                selectedRescheduleDayIdx === d.index
                                  ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md"
                                  : "bg-black/40 border-white/10 text-slate-300 hover:border-white/25"
                              }`}
                            >
                              <span className="text-[9px] font-bold uppercase">{d.dayName}</span>
                              <span className="text-sm font-black">{d.dateNumber}</span>
                              <span className="text-[9px] opacity-80">{d.month}</span>
                            </button>
                          ))}
                        </div>

                        {/* Available Hours for selected reschedule day */}
                        <div>
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block mb-2">
                            2. Elige la Nueva Hora ({targetRescheduleDay?.fullDateString})
                          </span>

                          {rescheduleVisibleSlots.length === 0 ? (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center text-xs text-amber-300">
                              No quedan horarios disponibles hoy. Selecciona mañana u otro día arriba.
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                              {rescheduleVisibleSlots.map((slot, idx) => {
                                const isBlocked =
                                  blockedSlots.includes(slot.time) ||
                                  blockedSlots.includes(`${targetRescheduleDay?.isoDate}_${slot.time}`);
                                const bookedCount = allBookings.filter(
                                  (b) =>
                                    b.id !== searchResult.id &&
                                    b.code !== searchResult.code &&
                                    (b.appointmentDate === targetRescheduleDay?.isoDate ||
                                      b.day === targetRescheduleDay?.fullDateString) &&
                                    b.time === slot.time &&
                                    Number(b.stage) < 5
                                ).length;
                                const isAvailable = !isBlocked && bookedCount < slotCapacity;

                                return (
                                  <button
                                    key={`${slot.time}-${idx}`}
                                    type="button"
                                    disabled={!isAvailable}
                                    onClick={() => {
                                      if (isAvailable) setSelectedRescheduleTime(slot.time);
                                    }}
                                    className={`py-2 px-2 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                                      !isAvailable
                                        ? "bg-red-950/20 border-red-900/30 text-slate-600 line-through cursor-not-allowed"
                                        : selectedRescheduleTime === slot.time
                                        ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm"
                                        : "bg-black/40 border-white/10 text-slate-200 hover:border-cyan-400/50 cursor-pointer"
                                    }`}
                                  >
                                    {slot.time}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Phone Last 4 Digits Security Check */}
                        <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                            Confirma los últimos 4 dígitos de tu celular (o código EXC):
                          </label>
                          <input
                            type="text"
                            maxLength={12}
                            placeholder="Ej: 4589 o EXC-123456"
                            value={verifyInput}
                            onChange={(e) => setVerifyInput(e.target.value)}
                            className="w-full bg-slate-950 border border-white/15 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none"
                          />
                        </div>

                        {actionError && (
                          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                            <span>{actionError}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setManageAction("none");
                              setActionError("");
                            }}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                          >
                            Volver
                          </button>
                          <button
                            type="button"
                            disabled={isProcessingAction}
                            onClick={handleConfirmReschedule}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isProcessingAction ? "Guardando..." : "Confirmar Nuevo Turno"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CANCEL DRAWER */}
                    {manageAction === "cancel" && (
                      <div className="pt-2 border-t border-white/10 space-y-3 animate-in fade-in">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 space-y-1">
                          <p className="font-bold text-red-300">
                            ¿Confirmas que deseas cancelar tu cita del {searchResult.day} a las {searchResult.time}?
                          </p>
                          <p className="text-[11px] text-slate-300">
                            Al cancelar se liberará tu cupo inmediatamente para otros usuarios.
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-2">
                          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                            Ingresa los últimos 4 dígitos de tu celular (o código EXC) para cancelar:
                          </label>
                          <input
                            type="text"
                            maxLength={12}
                            placeholder="Ej: 4589 o EXC-123456"
                            value={verifyInput}
                            onChange={(e) => setVerifyInput(e.target.value)}
                            className="w-full bg-slate-950 border border-white/15 focus:border-red-400 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none"
                          />
                        </div>

                        {actionError && (
                          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                            <span>{actionError}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setManageAction("none");
                              setActionError("");
                            }}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                          >
                            No, conservar cita
                          </button>
                          <button
                            type="button"
                            disabled={isProcessingAction}
                            onClick={handleConfirmCancel}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                          >
                            {isProcessingAction ? "Cancelando..." : "Sí, Cancelar Cita"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Locked state when < 60 minutes before appointment */
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2.5">
                    <div className="flex items-start gap-2 text-xs text-amber-200">
                      <Lock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>
                        Las modificaciones o cancelaciones solo están habilitadas con mínimo{" "}
                        <strong>1 hora de anticipación</strong> (límite: {modifyEligibility.deadlineTimeStr}). Si tuviste una urgencia, escríbenos directamente:
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                        `¡Hola Exclusive! Tengo una cita hoy a las ${searchResult.time} para el vehículo de placa ${searchResult.licensePlate} (${searchResult.code || ""}) y tuve un imprevisto.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>Avisar Imprevisto por WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Timeline (Real 5 stages from STAGE_CONFIG) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Progreso Actual del Servicio
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Etapa {searchResult.stage} de 5
                </span>
              </div>

              <div className="space-y-2">
                {STAGES_LIST.map((st) => {
                  const isDone = searchResult.stage >= st.id;
                  const isCurrent = searchResult.stage === st.id;

                  return (
                    <div
                      key={st.id}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                        isCurrent
                          ? "bg-cyan-500/15 border border-cyan-500/40 shadow-md shadow-cyan-500/10"
                          : isDone
                          ? "bg-white/[0.03] border border-white/5"
                          : "opacity-35 bg-transparent border border-transparent"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          isCurrent
                            ? "bg-cyan-400 text-slate-950 ring-4 ring-cyan-500/20 shadow-md shadow-cyan-500/40 animate-pulse"
                            : isDone
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.id}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs font-bold ${
                              isCurrent ? "text-cyan-300" : isDone ? "text-white" : "text-slate-400"
                            }`}
                          >
                            {st.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-cyan-400 text-slate-950 shrink-0 shadow-sm animate-pulse">
                              EN CURSO AHORA
                            </span>
                          )}
                          {isDone && !isCurrent && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                              Listo ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Status Notice Footer based on real stage */}
            {searchResult.stage === 5 ? (
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-slate-400" />
                <span>
                  <strong>Vehículo Entregado:</strong> Este servicio fue completado y entregado. ¡Gracias por confiar en Exclusive!
                </span>
              </div>
            ) : searchResult.stage === 4 ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-500/10">
                <Sparkles className="w-5 h-5 shrink-0 text-emerald-400 animate-bounce" />
                <span>
                  <strong>¡Tu vehículo está 100% listo!</strong> Ya puedes pasar a retirarlo por nuestra sede y realizar el pago en caja.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2.5">
                <Clock className="w-5 h-5 shrink-0 text-cyan-400 animate-spin" />
                <span>
                  <strong>En Proceso:</strong> Especialistas trabajando en {searchResult.bay || "bahía"}. Esta pantalla se actualiza automáticamente cada 6 segundos.
                </span>
              </div>
            )}

            {/* Receipt Trigger Button */}
            <button
              type="button"
              onClick={() => setIsReceiptOpen(true)}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Receipt className="w-4 h-4 text-cyan-400" />
              <span>Ver Comprobante / Recibo de Servicio</span>
            </button>
          </div>
        )}

        {/* Cancelled Confirmation State */}
        {!isLoading && cancelledBookingInfo && !searchResult && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-white">
                ¡Cita Cancelada Exitosamente!
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                La reserva para la placa <strong className="text-cyan-400 font-mono">{cancelledBookingInfo.plate}</strong> ({cancelledBookingInfo.day} • {cancelledBookingInfo.time}) fue cancelada y el horario ya quedó libre.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        )}

        {/* Not Found State (Real, without fake mocks) */}
        {!isLoading && hasSearched && !searchResult && !cancelledBookingInfo && (
          <div className="p-5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/30 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                No encontramos servicios activos para "{cleanPlateStr(plateQuery)}"
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Verifica que la placa esté bien escrita (ej: ABC123). Si acabas de ingresar o agendar tu cita, contáctanos directamente.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  `¡Hola Exclusive! Estoy consultando el estado de mi vehículo con placa ${cleanPlateStr(plateQuery)}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOMER RECEIPT MODAL */}
      <CustomerReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        booking={searchResult}
      />
    </div>
  );
}
