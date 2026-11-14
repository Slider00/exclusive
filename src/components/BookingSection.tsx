"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ServiceItem, SERVICES_LIST, formatCurrency, TIME_SLOTS, BUSINESS_CONFIG } from "@/data/servicesData";
import {
  getPromoEnabled,
  hasPlateUsedPromo,
  normalizePlate,
  getStoredBookings,
  getSlotsForDate,
  getSlotCapacity,
  time12hToMinutes,
  getColombiaNow,
} from "@/data/adminStore";
import { VehicleType } from "./ThreeVehicleCanvas";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Car, 
  User, 
  Phone, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  Copy,
  Printer,
  ChevronRight,
  Receipt,
  Tag
} from "lucide-react";
import confetti from "canvas-confetti";
import CustomerReceiptModal from "./admin/CustomerReceiptModal";

interface BookingSectionProps {
  selectedService: ServiceItem | null;
  selectedVehicle: VehicleType;
  onVehicleChange: (type: VehicleType) => void;
  onServiceChange: (service: ServiceItem) => void;
}

export default function BookingSection({
  selectedService,
  selectedVehicle,
  onVehicleChange,
  onServiceChange,
}: BookingSectionProps) {
  // Current active service fallback
  const activeService = selectedService || SERVICES_LIST[0];

  // Form State
  const [vehicleType, setVehicleType] = useState<VehicleType>(selectedVehicle);
  const [service, setService] = useState<ServiceItem>(activeService);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [licensePlate, setLicensePlate] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientNotes, setClientNotes] = useState<string>("");

  // Booking result state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);
  const [formError, setFormError] = useState<string>("");
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isPromoGlobalEnabled, setIsPromoGlobalEnabled] = useState<boolean>(true);
  const [wantPromoDiscount, setWantPromoDiscount] = useState<boolean>(true);

  useEffect(() => {
    setVehicleType(selectedVehicle);
  }, [selectedVehicle]);

  useEffect(() => {
    if (selectedService) {
      setService(selectedService);
    }
  }, [selectedService]);

  // Active week tab for quick switching ("semana1" | "semana2" | "semana3")
  const [activeWeekTab, setActiveWeekTab] = useState<number>(0); // 0: esta semana, 1: próxima semana, 2: en 2 semanas
  const [customDateValue, setCustomDateValue] = useState<string>("");
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [slotCapacity, setSlotCapacityState] = useState<number>(1);
  const [scheduleVersion, setScheduleVersion] = useState<number>(0);

  const [todayMinDate, setTodayMinDate] = useState<string>("");

  // Default fallback day during initial SSR prerender
  const DEFAULT_DAY = {
    index: 0,
    dayName: "Hoy",
    dateNumber: "--",
    month: "Esta sem",
    fullDateString: "Hoy",
    isoDate: "",
  };

  // Generate 21 days (3 full weeks) starting today
  const [weekDays, setWeekDays] = useState<Array<{
    index: number;
    dayName: string;
    dateNumber: number | string;
    month: string;
    fullDateString: string;
    isoDate: string;
  }>>([DEFAULT_DAY]);

  // Current time & date in Colombia (UTC-5)
  const [colombiaTime, setColombiaTime] = useState<{ totalMinutes: number; isoDate: string }>(() =>
    getColombiaNow()
  );

  const currentColombiaMinutes = colombiaTime.totalMinutes;
  const todayColombiaIso = colombiaTime.isoDate;

  // Keep time up-to-date every 10 seconds
  useEffect(() => {
    const updateTime = () => setColombiaTime(getColombiaNow());
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    const colNow = getColombiaNow();
    setTodayMinDate(colNow.isoDate);

    // Anchor the 21 days strictly to today in Colombia (UTC-5)
    const [yT, mT, dT] = colNow.isoDate.split("-").map(Number);
    const computedDays = Array.from({ length: 21 }).map((_, index) => {
      const date = new Date(yT, mT - 1, dT + index);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const isoDate = `${y}-${m}-${d}`;
      return {
        index,
        dayName: index === 0 ? "Hoy" : index === 1 ? "Mañana" : dayNames[date.getDay()],
        dateNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        fullDateString: `${dayNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}`,
        isoDate,
      };
    });
    setWeekDays(computedDays);

    // Load existing bookings, promo status and blocked slots to verify capacity & promo eligibility
    try {
      const stored = getStoredBookings();
      setExistingBookings(stored);
      const blocked = JSON.parse(localStorage.getItem("exclusive_blocked_slots") || "[]");
      setBlockedSlots(blocked);
      setIsPromoGlobalEnabled(getPromoEnabled());
      setSlotCapacityState(getSlotCapacity());

      // Also fetch latest bookings from MongoDB so promo check is 100% up-to-date across devices
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.bookings) && data.bookings.length > 0) {
            setExistingBookings(data.bookings);
            localStorage.setItem("exclusive_bookings", JSON.stringify(data.bookings));
          }
        })
        .catch(() => {});
    } catch {
      // ignore
    }

    const handlePromoToggleEvent = () => {
      setIsPromoGlobalEnabled(getPromoEnabled());
    };
    const handleScheduleChangeEvent = () => {
      setSlotCapacityState(getSlotCapacity());
      try {
        const blocked = JSON.parse(localStorage.getItem("exclusive_blocked_slots") || "[]");
        setBlockedSlots(blocked);
      } catch {}
      setScheduleVersion((v) => v + 1);
    };
    window.addEventListener("exclusive_promo_changed", handlePromoToggleEvent);
    window.addEventListener("exclusive_schedule_changed", handleScheduleChangeEvent);
    return () => {
      window.removeEventListener("exclusive_promo_changed", handlePromoToggleEvent);
      window.removeEventListener("exclusive_schedule_changed", handleScheduleChangeEvent);
    };
  }, []);

  const selectedDay = weekDays[selectedDayIndex] || weekDays[0] || DEFAULT_DAY;
  const isSelectedDayToday =
    selectedDayIndex === 0 ||
    selectedDay.isoDate === todayColombiaIso ||
    (selectedDay.dayName || "").toLowerCase().includes("hoy");

  // Active dynamic slots configured by Admin for this date (or global default)
  const activeDaySlots = React.useMemo(
    () => getSlotsForDate(selectedDay.isoDate),
    [selectedDay.isoDate, scheduleVersion]
  );

  // Filter out past hours for TODAY so they DO NOT APPEAR at all
  const visibleDaySlots = React.useMemo(() => {
    return activeDaySlots.filter((slot) => {
      if (!isSelectedDayToday) return true;
      const slotMinutes = time12hToMinutes(slot.time);
      return slotMinutes > currentColombiaMinutes;
    });
  }, [activeDaySlots, isSelectedDayToday, currentColombiaMinutes]);

  // Truly available slots count (among visible, not blocked, has capacity)
  const availableSlotsCount = React.useMemo(() => {
    return visibleDaySlots.filter((slot) => {
      const isBlocked =
        blockedSlots.includes(slot.time) ||
        blockedSlots.includes(`${selectedDay.isoDate}_${slot.time}`);
      const bookedCount = existingBookings.filter(
        (b) =>
          (b.appointmentDate === selectedDay.isoDate ||
            b.day === selectedDay.fullDateString) &&
          b.time === slot.time &&
          b.stage < 5
      ).length;
      return !isBlocked && bookedCount < slotCapacity;
    }).length;
  }, [
    visibleDaySlots,
    blockedSlots,
    selectedDay.isoDate,
    selectedDay.fullDateString,
    existingBookings,
    slotCapacity,
  ]);

  // If currently selected slot is in the past for today, automatically deselect it
  useEffect(() => {
    if (isSelectedDayToday && selectedTimeSlot) {
      const slotMin = time12hToMinutes(selectedTimeSlot);
      if (slotMin <= currentColombiaMinutes) {
        setSelectedTimeSlot("");
      }
    }
  }, [isSelectedDayToday, selectedTimeSlot, currentColombiaMinutes]);

  // Handle custom date selection from input
  const handleCustomDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.value;
    if (!picked) return;
    setCustomDateValue(picked);

    // Check if this date already exists in weekDays
    const foundIndex = weekDays.findIndex((d) => d.isoDate === picked);
    if (foundIndex !== -1) {
      setSelectedDayIndex(foundIndex);
      setActiveWeekTab(Math.floor(foundIndex / 7));
    } else {
      // Add custom day dynamically
      const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const parts = picked.split("-").map(Number);
      const customDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      const newIndex = weekDays.length;
      const newDayItem = {
        index: newIndex,
        dayName: dayNames[customDateObj.getDay()],
        dateNumber: customDateObj.getDate(),
        month: monthNames[customDateObj.getMonth()],
        fullDateString: `${dayNames[customDateObj.getDay()]}, ${customDateObj.getDate()} de ${monthNames[customDateObj.getMonth()]}`,
        isoDate: picked,
      };
      setWeekDays((prev) => [...prev, newDayItem]);
      setSelectedDayIndex(newIndex);
    }
  };

  // Format Plate uppercase
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setLicensePlate(raw);
  };

  const basePrice = service.prices[vehicleType] || 0;
  const cleanPlateAlpha = normalizePlate(licensePlate);
  const isPlateEntered = cleanPlateAlpha.length >= 5;
  const promoCheck = isPlateEntered
    ? hasPlateUsedPromo(licensePlate, existingBookings)
    : { used: false, previousBooking: undefined };

  const canApplyPromo = isPromoGlobalEnabled && isPlateEntered && !promoCheck.used && wantPromoDiscount;
  const discountAmount = canApplyPromo ? Math.round(basePrice * 0.15) : 0;
  const currentPrice = Math.max(0, basePrice - discountAmount);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedTimeSlot) {
      setFormError("Por favor selecciona una hora disponible para tu cita.");
      return;
    }
    const slotMin = time12hToMinutes(selectedTimeSlot);
    if (isSelectedDayToday && slotMin <= currentColombiaMinutes) {
      setFormError("La hora seleccionada ya transcurrió hoy. Por favor elige un horario disponible o agenda para mañana.");
      return;
    }
    if (!licensePlate.trim() || cleanPlateAlpha.length < 5) {
      setFormError("Por favor ingresa una placa válida (ej: ABC-123 o ABC-12D).");
      return;
    }
    if (!clientName.trim()) {
      setFormError("Por favor ingresa tu nombre.");
      return;
    }
    if (!clientPhone.trim() || clientPhone.length < 7) {
      setFormError("Por favor ingresa un número de teléfono o WhatsApp válido.");
      return;
    }

    // Re-check promo eligibility right before saving
    const latestCheck = hasPlateUsedPromo(licensePlate, existingBookings);
    const applyPromoNow = isPromoGlobalEnabled && !latestCheck.used && wantPromoDiscount;
    const finalDiscount = applyPromoNow ? Math.round(basePrice * 0.15) : 0;
    const finalPrice = Math.max(0, basePrice - finalDiscount);

    setIsSubmitting(true);

    // Simulate instant local reservation storage
    setTimeout(() => {
      const bookingCode = `EXC-${Math.floor(100000 + Math.random() * 900000)}`;
      const newBooking = {
        id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        code: bookingCode,
        licensePlate: licensePlate.toUpperCase(),
        vehicleType,
        serviceId: service.id,
        serviceName: service.name,
        originalPrice: basePrice,
        discountPercent: applyPromoNow ? 15 : 0,
        promoCode: applyPromoNow ? "INAUGURACION15" : "",
        price: finalPrice,
        day: selectedDay.fullDateString,
        appointmentDate: selectedDay.isoDate || new Date().toISOString().slice(0, 10),
        time: selectedTimeSlot,
        clientName,
        clientPhone,
        clientNotes: applyPromoNow
          ? `${clientNotes ? clientNotes + " • " : ""}[Bono Inauguración 15% OFF Aplicado]`
          : clientNotes,
        isWalkIn: false,
        bay: "Bahía 1 (Lavado)",
        stage: 1,
        stageName: "En Espera / Recepción",
        paymentMethod: "pendiente",
        isPaid: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "confirmada",
      };

      // Save locally to localStorage so track modal can find it immediately
      try {
        const stored = JSON.parse(localStorage.getItem("exclusive_bookings") || "[]");
        stored.push(newBooking);
        localStorage.setItem("exclusive_bookings", JSON.stringify(stored));
        setExistingBookings(stored);

        // Sync to MongoDB backend in background
        fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBooking),
        }).catch(() => {});
      } catch (err) {
        console.error("Local storage error:", err);
      }

      setBookingConfirmed(newBooking);
      setIsSubmitting(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00f0ff", "#3b82f6", "#ffffff", "#10b981"],
        });
      } catch (err) {
        // ignore if fails
      }
    }, 600);
  };

  // WhatsApp pre-filled message generator
  const getWhatsAppBookingLink = () => {
    if (!bookingConfirmed) return "#";
    const promoLine =
      bookingConfirmed.discountPercent > 0
        ? `🎁 *Bono Aplicado:* 15% OFF Inauguración (-${formatCurrency((bookingConfirmed.originalPrice || bookingConfirmed.price) - bookingConfirmed.price)})\n`
        : "";
    const text = encodeURIComponent(
      `¡Hola Exclusive Detailing! Acabo de agendar una cita.\n\n` +
      `📌 *Código Cita:* ${bookingConfirmed.code}\n` +
      `🚗 *Placa:* ${bookingConfirmed.licensePlate}\n` +
      `🚘 *Vehículo:* ${bookingConfirmed.vehicleType.toUpperCase()}\n` +
      `✨ *Servicio:* ${bookingConfirmed.serviceName}\n` +
      `📅 *Fecha:* ${bookingConfirmed.day}\n` +
      `⏰ *Hora:* ${bookingConfirmed.time}\n` +
      `👤 *Cliente:* ${bookingConfirmed.clientName}\n` +
      promoLine +
      `💰 *Valor Final:* ${formatCurrency(bookingConfirmed.price)}\n\n` +
      `Por favor confirmar recepción. ¡Gracias!`
    );
    // WhatsApp phone number configured in BUSINESS_CONFIG (src/data/servicesData.ts)
    return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${text}`;
  };

  return (
    <section id="agendar" className="py-20 px-4 max-w-7xl mx-auto relative">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Agendamiento Rápido en 30 Segundos</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Reserva tu Turno <span className="text-gradient-cyan">Sin Registro</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Sin contraseñas ni formularios molestos. Elige tu horario en la semana, ingresa la placa de tu vehículo y tu WhatsApp para coordinar tu llegada.
        </p>
      </div>

      {!bookingConfirmed ? (
        <form onSubmit={handleBookingSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Vehicle, Service, Date & Time (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* STEP 1: Tipo de Vehículo */}
              <div>
                <label className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">1</span>
                  Tipo de Vehículo
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "carro" as VehicleType, name: "Automóvil", icon: "🚗" },
                    { id: "camioneta" as VehicleType, name: "Camioneta", icon: "🚙" },
                    { id: "moto" as VehicleType, name: "Motocicleta", icon: "🏍️" },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setVehicleType(v.id);
                        onVehicleChange(v.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        vehicleType === v.id
                          ? "bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-slate-600"
                      }`}
                    >
                      <span className="text-2xl">{v.icon}</span>
                      <span className="text-xs font-bold">{v.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: Servicio */}
              <div>
                <label className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">2</span>
                  Servicio Seleccionado
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES_LIST.filter(s => s.prices[vehicleType] > 0).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setService(s);
                        onServiceChange(s);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        service.id === s.id
                          ? "bg-cyan-500/10 border-cyan-400 text-white ring-1 ring-cyan-400"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{s.name}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">~{s.durationMinutes}m</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{s.tagline}</p>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-xs font-extrabold text-cyan-400">
                          {formatCurrency(s.prices[vehicleType])}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: Calendario de la Semana y Días Futuros */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <label className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                    Día del Agendamiento
                  </label>

                  {/* Week Tabs & Custom Date Shortcut */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="inline-flex rounded-xl bg-white/[0.04] p-0.5 border border-white/10 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveWeekTab(0);
                          if (selectedDayIndex >= 7) setSelectedDayIndex(0);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          activeWeekTab === 0
                            ? "bg-cyan-500 text-black shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Esta Semana
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveWeekTab(1);
                          if (selectedDayIndex < 7 || selectedDayIndex >= 14) setSelectedDayIndex(7);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          activeWeekTab === 1
                            ? "bg-cyan-500 text-black shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Próx. Semana
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveWeekTab(2);
                          if (selectedDayIndex < 14) setSelectedDayIndex(14);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                          activeWeekTab === 2
                            ? "bg-cyan-500 text-black shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        En 2 Semanas
                      </button>
                    </div>

                    {/* Direct Date Picker */}
                    <div className="relative inline-flex items-center">
                      <label className="cursor-pointer px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all">
                        <CalendarIcon className="w-3 h-3 text-cyan-400" />
                        <span>Otra fecha</span>
                        <input
                          type="date"
                          min={todayMinDate || undefined}
                          value={customDateValue}
                          onChange={handleCustomDateSelect}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Day Buttons Carousel (Filtered by activeWeekTab) */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {weekDays
                    .slice(activeWeekTab * 7, activeWeekTab * 7 + 7)
                    .map((day) => (
                      <button
                        key={day.index}
                        type="button"
                        onClick={() => {
                          setSelectedDayIndex(day.index);
                          setSelectedTimeSlot(""); // Reset slot when day changes
                        }}
                        className={`min-w-[76px] py-3 px-2 rounded-2xl border text-center transition-all shrink-0 flex flex-col items-center gap-1 ${
                          selectedDayIndex === day.index
                            ? "bg-gradient-to-b from-cyan-500 to-blue-600 text-black border-cyan-400 font-extrabold shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-slate-600 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-[11px] font-bold uppercase tracking-wider">{day.dayName}</span>
                        <span className="text-lg font-black">{day.dateNumber}</span>
                        <span className="text-[10px] font-medium opacity-80">{day.month}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* STEP 4: Horarios Disponibles con Verificación de Cupos y Bloqueo de Horas Pasadas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">4</span>
                    Horas Disponibles para {selectedDay.fullDateString}
                  </label>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full inline-block ${availableSlotsCount > 0 ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
                    <span>
                      {availableSlotsCount}{" "}
                      {availableSlotsCount === 1 ? "horario disponible" : "horarios disponibles"}
                    </span>
                  </span>
                </div>

                {visibleDaySlots.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center space-y-3">
                    <Clock className="w-8 h-8 text-amber-400 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {isSelectedDayToday
                          ? "Turnos finalizados para hoy"
                          : "No hay turnos disponibles para esta fecha"}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {isSelectedDayToday
                          ? "Las horas de atención del día de hoy ya transcurrieron. ¡Te invitamos a agendar tu cita para mañana o los próximos días!"
                          : "Los horarios para esta fecha están ocupados o bloqueados."}
                      </p>
                    </div>
                    {isSelectedDayToday && weekDays.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDayIndex(1);
                          if (activeWeekTab !== 0) setActiveWeekTab(0);
                        }}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                      >
                        Ver Horarios para Mañana →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {visibleDaySlots.map((slot, idx) => {
                      const isBlocked =
                        blockedSlots.includes(slot.time) ||
                        blockedSlots.includes(`${selectedDay.isoDate}_${slot.time}`);
                      const bookedCount = existingBookings.filter(
                        (b) =>
                          (b.appointmentDate === selectedDay.isoDate ||
                            b.day === selectedDay.fullDateString) &&
                          b.time === slot.time &&
                          b.stage < 5
                      ).length;
                      const remainingBays = Math.max(0, slotCapacity - bookedCount);
                      const isAvailable = !isBlocked && remainingBays > 0;

                      return (
                        <button
                          key={`${slot.time}-${idx}`}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedTimeSlot(slot.time);
                            }
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 select-none ${
                            !isAvailable
                              ? "bg-red-950/20 border-red-900/30 text-slate-500 cursor-not-allowed line-through opacity-60 pointer-events-none"
                              : selectedTimeSlot === slot.time
                              ? "bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300"
                              : "bg-white/[0.03] border-white/10 text-slate-200 hover:border-cyan-400/50 hover:text-white cursor-pointer"
                          }`}
                          title={!isAvailable ? "Cupo no disponible para este horario" : "Disponible para agendar"}
                        >
                          <span className="font-mono">{slot.time}</span>
                          <span className="text-[9px] uppercase font-bold">
                            {!isAvailable
                              ? "Ocupado"
                              : slotCapacity > 1
                              ? `${remainingBays} ${remainingBays === 1 ? "cupo" : "cupos"}`
                              : "Libre"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Client Contact Data & Summary Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:pl-4 lg:border-l border-white/10">
              
              {/* Client Form Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-sm uppercase font-bold text-slate-200 tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Tus Datos (Sin Registro)
                  </h3>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    Rápido & Seguro
                  </span>
                </div>

                {/* Placa Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Placa del Vehículo <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      value={licensePlate}
                      onChange={handlePlateChange}
                      placeholder="EJ: ABC-123"
                      className="w-full bg-black/40 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm font-mono tracking-widest uppercase text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                    />
                    <div className="absolute right-3 top-3 text-xs text-slate-500 font-mono">COL</div>
                  </div>

                  {/* Real-time 15% OFF One-Time Promo Validator by Plate */}
                  {isPromoGlobalEnabled && (
                    <div className="mt-2.5">
                      {!isPlateEntered ? (
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center gap-2 text-[11px] text-cyan-300">
                          <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>
                            Ingresa tu placa para validar tu <strong>Bono de Inauguración 15% OFF</strong> (válido 1 vez por placa).
                          </span>
                        </div>
                      ) : promoCheck.used ? (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-300 block">
                              Bono 15% OFF ya redimido por esta placa
                            </span>
                            <span className="text-[11px] text-slate-300">
                              La placa <strong className="font-mono text-white">{licensePlate}</strong> ya canjeó su descuento único de inauguración{promoCheck.previousBooking?.code ? ` (Turno ${promoCheck.previousBooking.code})` : ""}. Se aplicará la tarifa estándar.
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2.5 text-xs animate-in fade-in">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-emerald-300 block">
                                ¡Bono 15% OFF Disponible para {licensePlate}!
                              </span>
                              <span className="text-[11px] text-slate-300">
                                Ahorras <strong>{formatCurrency(Math.round(basePrice * 0.15))}</strong> en esta lavada (uso único).
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setWantPromoDiscount(!wantPromoDiscount)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                              wantPromoDiscount
                                ? "bg-emerald-400 text-slate-950 shadow-sm"
                                : "bg-white/10 text-slate-300 hover:bg-white/15"
                            }`}
                          >
                            {wantPromoDiscount ? "15% Aplicado ✓" : "Usar Bono"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Nombre Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tu Nombre o Alias <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Carlos Perez"
                    className="w-full bg-black/40 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Número de WhatsApp <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej: 312 345 6789"
                    className="w-full bg-black/40 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Te enviaremos el recordatorio y te avisaremos por WhatsApp cuando tu vehículo esté listo.
                  </p>
                </div>

                {/* Comentarios Adicionales */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Notas o Instrucciones Especiales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Ej: Enfoque especial en los rines o manchas en el asiento trasero..."
                    className="w-full bg-black/40 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-slate-950/60 rounded-2xl p-5 border border-white/10 space-y-3">
                <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Resumen de tu Cita
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Tratamiento:</span>
                    <span className="font-semibold text-white">{service.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vehículo:</span>
                    <span className="font-semibold text-cyan-400 uppercase">{vehicleType}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Fecha:</span>
                    <span className="font-semibold text-white">{selectedDay.fullDateString}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Hora:</span>
                    <span className="font-semibold text-cyan-400">{selectedTimeSlot || "Por seleccionar"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-1.5">
                  {canApplyPromo && (
                    <>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Tarifa Base:</span>
                        <span className="line-through">{formatCurrency(basePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>Bono Inauguración (15% OFF):</span>
                        </span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Total Estimado:</span>
                    <span className="text-2xl font-black text-white">{formatCurrency(currentPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-slate-950 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Generando Cita...
                  </span>
                ) : (
                  <>
                    <span>Confirmar Agendamiento</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* CONFIRMATION TICKET DIGITAL */
        <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 border border-cyan-500/40 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" />
          
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Image
                src="/images/logo.png"
                alt="Exclusive Detallado de Vehículos"
                width={180}
                height={50}
                className="h-10 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,240,255,0.2)]"
              />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              ¡Cita Agendada con Éxito!
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Turno {bookingConfirmed.code}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Guarda este código para consultar el avance del lavado o presentarlo al llegar.
            </p>
          </div>

          {/* Ticket Body */}
          <div className="bg-black/40 rounded-2xl p-6 border border-white/10 space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Placa:</span>
                <span className="font-mono text-base font-black text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/30 inline-block">
                  {bookingConfirmed.licensePlate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Vehículo:</span>
                <span className="font-bold text-white uppercase text-sm">
                  {bookingConfirmed.vehicleType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Fecha & Hora:</span>
                <span className="font-semibold text-white">
                  {bookingConfirmed.day} - {bookingConfirmed.time}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Titular:</span>
                <span className="font-semibold text-white">
                  {bookingConfirmed.clientName}
                </span>
              </div>
              <div className="col-span-2 pt-3 border-t border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tratamiento:</span>
                  <span className="font-bold text-white text-sm">{bookingConfirmed.serviceName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Total a Pagar en Sitio:</span>
                  <span className="text-xl font-black text-emerald-400">{formatCurrency(bookingConfirmed.price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsReceiptOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4 text-slate-950" />
              <span>Ver e Imprimir Recibo / Comprobante de Cita</span>
            </button>

            <a
              href={getWhatsAppBookingLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba59] text-black shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Enviar Confirmación a Nuestro WhatsApp</span>
            </a>

            <button
              onClick={() => {
                setBookingConfirmed(null);
                setSelectedTimeSlot("");
                setLicensePlate("");
                setClientNotes("");
              }}
              className="w-full py-3 rounded-xl font-semibold text-xs bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              Agendar Otra Cita
            </button>
          </div>
        </div>
      )}

      {/* CUSTOMER RECEIPT MODAL */}
      <CustomerReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        booking={bookingConfirmed}
      />
    </section>
  );
}
