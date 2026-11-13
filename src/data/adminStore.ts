import { VehicleType, SERVICES_LIST, TIME_SLOTS, formatCurrency } from "./servicesData";

export type BookingStage = 1 | 2 | 3 | 4 | 5;

export interface AdminBooking {
  id: string;
  code: string;
  licensePlate: string;
  vehicleType: VehicleType;
  serviceId: string;
  serviceName: string;
  originalPrice?: number;
  discountPercent?: number;
  promoCode?: string;
  price: number;
  day: string;
  appointmentDate?: string; // e.g. "2026-10-21" (YYYY-MM-DD)
  time: string;
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  isWalkIn: boolean; // True si llegó sin turno previo
  bay: string; // e.g. "Bahía 1 (Lavado)", "Bahía 2 (Secado/Detallado)", "Bahía 3 (Motos)"
  stage: BookingStage; // 1: Recepción, 2: En Lavado, 3: Detallado/Secado, 4: Listo para Retiro, 5: Entregado
  stageName: string;
  paymentMethod: "efectivo" | "nequi" | "daviplata" | "tarjeta" | "pendiente";
  isPaid: boolean;
  assignedEmployee?: string; // Nombre del lavador/operario que lo tomó o lavó
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_EMPLOYEES = [
  "Carlos Moreno",
  "Andrés Valencia",
  "Mateo Gómez",
  "Javier Ramírez",
  "Sebastián Castro",
];

export interface ExpenseItem {
  id: string;
  description: string;
  category: "insumos" | "servicios" | "nomina" | "mantenimiento" | "otro";
  amount: number;
  date: string; // e.g. "2026-10-20" or "Hoy"
  time: string;
  createdAt?: string; // ISO date string
  notes?: string;
}

export const STAGE_CONFIG: Record<BookingStage, { label: string; shortLabel: string; color: string; badgeClass: string }> = {
  1: {
    label: "En Espera / Recepción",
    shortLabel: "1. En Espera",
    color: "#f59e0b",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  2: {
    label: "En Bahía de Lavado",
    shortLabel: "2. Lavando",
    color: "#00f0ff",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse",
  },
  3: {
    label: "Detallado & Secado",
    shortLabel: "3. Secado",
    color: "#3b82f6",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  4: {
    label: "¡Listo para Retiro!",
    shortLabel: "4. ¡Listo!",
    color: "#10b981",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  5: {
    label: "Entregado & Finalizado",
    shortLabel: "5. Entregado",
    color: "#64748b",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

const STORAGE_KEY_BOOKINGS = "exclusive_bookings";
const STORAGE_KEY_EXPENSES = "exclusive_admin_expenses";
const STORAGE_KEY_BLOCKED_SLOTS = "exclusive_blocked_slots";
const STORAGE_KEY_PROMO_ENABLED = "exclusive_promo_15_enabled";
const STORAGE_KEY_GLOBAL_SLOTS = "exclusive_custom_global_slots";
const STORAGE_KEY_DATE_SLOTS = "exclusive_custom_date_slots";
const STORAGE_KEY_SLOT_CAPACITY = "exclusive_slot_capacity";

// Helper: Convert 12h string ("08:30 AM" / "02:15 PM") to minutes since midnight for chronological sorting
export function time12hToMinutes(timeStr: string): number {
  const clean = (timeStr || "").trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 9999;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = match[3];
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
}

// Helper: Convert 24h ("14:20") or 12h ("2:20 pm") into standard "02:20 PM"
export function formatTo12HourSlot(input: string): string | null {
  const raw = (input || "").trim().toUpperCase();
  if (!raw) return null;

  const match12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    const h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    if (h < 1 || h > 12 || m < 0 || m > 59) return null;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${match12[3]}`;
  }

  const match24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h24 = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h24 < 0 || h24 > 23 || m < 0 || m > 59) return null;
    const period = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
  }

  return null;
}

// Helper: Generate slots by interval (20, 30, 45, 60 min) from startHour to endHour
export function generateIntervalSlots(
  intervalMinutes: 20 | 30 | 45 | 60,
  startHour = 8,
  endHour = 18
): string[] {
  const result: string[] = [];
  const startTotal = startHour * 60;
  const endTotal = endHour * 60;
  for (let mins = startTotal; mins <= endTotal - intervalMinutes; mins += intervalMinutes) {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const formatted = formatTo12HourSlot(
      `${h24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
    if (formatted) result.push(formatted);
  }
  return result;
}

// Helper: Get active time slots for a specific date (or global default)
export function getSlotsForDate(dateIso?: string): Array<{ time: string; available: boolean }> {
  const defaultList = TIME_SLOTS.map((s) => s.time);
  if (typeof window === "undefined") {
    return defaultList.map((time) => ({ time, available: true }));
  }

  try {
    if (dateIso) {
      const byDateRaw = localStorage.getItem(STORAGE_KEY_DATE_SLOTS);
      if (byDateRaw) {
        const byDate = JSON.parse(byDateRaw);
        if (byDate && Array.isArray(byDate[dateIso]) && byDate[dateIso].length > 0) {
          const sorted = [...byDate[dateIso]].sort(
            (a, b) => time12hToMinutes(a) - time12hToMinutes(b)
          );
          return sorted.map((time: string) => ({ time, available: true }));
        }
      }
    }

    const globalRaw = localStorage.getItem(STORAGE_KEY_GLOBAL_SLOTS);
    if (globalRaw) {
      const parsed = JSON.parse(globalRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sorted = [...parsed].sort(
          (a, b) => time12hToMinutes(a) - time12hToMinutes(b)
        );
        return sorted.map((time: string) => ({ time, available: true }));
      }
    }
  } catch {
    // ignore
  }

  return defaultList.map((time) => ({ time, available: true }));
}

// Helper: Save slots for a specific date or globally for all days
export function saveSlotsConfiguration(
  slots: string[],
  dateIso?: string,
  applyToAllDays = false
): string[] {
  const uniqueSorted = Array.from(new Set(slots)).sort(
    (a, b) => time12hToMinutes(a) - time12hToMinutes(b)
  );

  if (typeof window !== "undefined") {
    try {
      if (applyToAllDays || !dateIso) {
        localStorage.setItem(STORAGE_KEY_GLOBAL_SLOTS, JSON.stringify(uniqueSorted));
        // If applying globally, also clear any override for the current date so it uses the new global template
        if (dateIso) {
          const byDateRaw = localStorage.getItem(STORAGE_KEY_DATE_SLOTS);
          if (byDateRaw) {
            const byDate = JSON.parse(byDateRaw);
            delete byDate[dateIso];
            localStorage.setItem(STORAGE_KEY_DATE_SLOTS, JSON.stringify(byDate));
          }
        }
      } else {
        const byDateRaw = localStorage.getItem(STORAGE_KEY_DATE_SLOTS);
        const byDate = byDateRaw ? JSON.parse(byDateRaw) : {};
        byDate[dateIso] = uniqueSorted;
        localStorage.setItem(STORAGE_KEY_DATE_SLOTS, JSON.stringify(byDate));
      }
      window.dispatchEvent(new Event("exclusive_schedule_changed"));
    } catch {
      // ignore
    }
  }

  return uniqueSorted;
}

// Helper: Get simultaneous vehicle capacity per slot (1, 2, or 3 bays)
export function getSlotCapacity(): number {
  if (typeof window === "undefined") return 1;
  try {
    const val = Number(localStorage.getItem(STORAGE_KEY_SLOT_CAPACITY));
    if (val >= 1 && val <= 5) return val;
    return 1;
  } catch {
    return 1;
  }
}

// Helper: Set simultaneous vehicle capacity per slot
export function setSlotCapacity(capacity: number): number {
  const safeCap = Math.max(1, Math.min(5, Math.round(capacity)));
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_SLOT_CAPACITY, String(safeCap));
      window.dispatchEvent(new Event("exclusive_schedule_changed"));
    } catch {
      // ignore
    }
  }
  return safeCap;
}

// Helper: Normalize license plate (strip spaces, hyphens and symbols)
export function normalizePlate(plate: string): string {
  return (plate || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Helper: Check if Inauguration 15% OFF Promo is globally enabled by Admin
export function getPromoEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(STORAGE_KEY_PROMO_ENABLED);
    if (val === null) return true; // Enabled by default
    return val === "true";
  } catch {
    return true;
  }
}

// Helper: Toggle Inauguration 15% OFF Promo from Admin Panel
export function setPromoEnabled(enabled: boolean): boolean {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_PROMO_ENABLED, enabled ? "true" : "false");
      window.dispatchEvent(new Event("exclusive_promo_changed"));
    } catch {
      // ignore
    }
  }
  return enabled;
}

// Helper: Check if a license plate has already redeemed the one-time 15% OFF promo
export function hasPlateUsedPromo(
  plate: string,
  bookingsList?: AdminBooking[]
): { used: boolean; previousBooking?: AdminBooking } {
  const clean = normalizePlate(plate);
  if (clean.length < 4) return { used: false };

  const list = bookingsList || getStoredBookings();
  const found = list.find(
    (b) =>
      normalizePlate(b.licensePlate) === clean &&
      ((b.discountPercent && b.discountPercent > 0) ||
        b.promoCode === "INAUGURACION15")
  );

  return {
    used: Boolean(found),
    previousBooking: found,
  };
}

// Initial seed bookings (Empty for clean production/testing start from 0)
const INITIAL_DEMO_BOOKINGS: AdminBooking[] = [];

const INITIAL_DEMO_EXPENSES: ExpenseItem[] = [];

const STORAGE_KEY_CLEAN_START = "exclusive_clean_start_v1";

function ensureCleanStartMigration() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(STORAGE_KEY_CLEAN_START) !== "true") {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify([]));
      localStorage.removeItem(STORAGE_KEY_BLOCKED_SLOTS);
      localStorage.setItem(STORAGE_KEY_CLEAN_START, "true");
      fetch("/api/bookings?all=true", { method: "DELETE" }).catch(() => {});
      fetch("/api/expenses?all=true", { method: "DELETE" }).catch(() => {});
    }
  } catch {
    // ignore
  }
}

// Helper: Get all bookings
export function getStoredBookings(): AdminBooking[] {
  if (typeof window === "undefined") return INITIAL_DEMO_BOOKINGS;
  ensureCleanStartMigration();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    if (parsed.length === 0) {
      return [];
    }

    // Sanitize each booking to guarantee valid stage and fields
    return parsed.map((b: any, index: number): AdminBooking => {
      const validStage = (b.stage && STAGE_CONFIG[b.stage as BookingStage])
        ? (Number(b.stage) as BookingStage)
        : 1;

      return {
        id: b.id || `b-stored-${index}-${Date.now()}`,
        code: b.code || `EXC-${Math.floor(1000 + Math.random() * 9000)}`,
        licensePlate: (b.licensePlate || "EXC-000").toUpperCase(),
        vehicleType: (b.vehicleType as VehicleType) || "carro",
        serviceId: b.serviceId || "lavado-full",
        serviceName: b.serviceName || "Lavado Full",
        originalPrice: typeof b.originalPrice === "number" ? b.originalPrice : (typeof b.price === "number" ? b.price : 40000),
        discountPercent: typeof b.discountPercent === "number" ? b.discountPercent : 0,
        promoCode: b.promoCode || "",
        price: typeof b.price === "number" ? b.price : 40000,
        day: b.day || "Hoy",
        time: b.time || "10:00 AM",
        clientName: b.clientName || "Cliente",
        clientPhone: b.clientPhone || "3100000000",
        clientNotes: b.clientNotes || "",
        isWalkIn: Boolean(b.isWalkIn),
        bay: b.bay || "Bahía 1 (Lavado)",
        stage: validStage,
        stageName: STAGE_CONFIG[validStage]?.label || "En Espera / Recepción",
        assignedEmployee: b.assignedEmployee || "",
        appointmentDate: b.appointmentDate || "",
        paymentMethod: b.paymentMethod || "pendiente",
        isPaid: Boolean(b.isPaid),
        createdAt: b.createdAt || new Date().toISOString(),
        updatedAt: b.updatedAt || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error("Error reading bookings:", err);
    return INITIAL_DEMO_BOOKINGS;
  }
}

// Helper: Save a new booking (Walk-in or Web)
export function saveNewBooking(booking: Omit<AdminBooking, "id" | "code" | "createdAt" | "updatedAt" | "stageName">): AdminBooking {
  const code = `EXC-${Math.floor(100000 + Math.random() * 900000)}`;
  const stageName = STAGE_CONFIG[booking.stage]?.label || "En Espera";
  const now = new Date().toISOString();

  const newBooking: AdminBooking = {
    ...booking,
    id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    code,
    stageName,
    createdAt: now,
    updatedAt: now,
  };

  const current = getStoredBookings();
  const updated = [newBooking, ...current.filter((b) => b.id !== newBooking.id && b.code !== newBooking.code)];

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    // Asynchronously sync to MongoDB backend
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking),
    }).catch(() => {});
  }

  return newBooking;
}

// Helper: Update booking stage, bay, payment and/or assigned employee
export function updateBookingStage(
  bookingId: string,
  newStage: BookingStage,
  newBay?: string,
  isPaid?: boolean,
  paymentMethod?: AdminBooking["paymentMethod"],
  assignedEmployee?: string
): AdminBooking[] {
  const current = getStoredBookings();
  let resolvedEmployee = assignedEmployee;

  const updated = current.map((b) => {
    if (b.id === bookingId || b.code === bookingId) {
      const emp = assignedEmployee !== undefined ? assignedEmployee : (b.assignedEmployee || "");
      resolvedEmployee = emp;
      return {
        ...b,
        stage: newStage,
        stageName: STAGE_CONFIG[newStage]?.label || b.stageName,
        bay: newBay || b.bay,
        isPaid: isPaid !== undefined ? isPaid : (newStage === 5 ? true : b.isPaid),
        paymentMethod: paymentMethod || b.paymentMethod,
        assignedEmployee: emp,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    // Asynchronously update MongoDB backend
    const targetBooking = updated.find((b) => b.id === bookingId || b.code === bookingId);
    fetch("/api/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bookingId,
        stage: newStage,
        stageName: STAGE_CONFIG[newStage]?.label,
        bay: newBay || targetBooking?.bay,
        isPaid: targetBooking?.isPaid,
        paymentMethod: targetBooking?.paymentMethod,
        assignedEmployee: resolvedEmployee || targetBooking?.assignedEmployee || "",
      }),
    }).catch(() => {});
  }

  return updated;
}

// Helper: Assign or update employee/washer for a booking
export function updateBookingEmployee(
  bookingId: string,
  employeeName: string
): AdminBooking[] {
  const current = getStoredBookings();
  const updated = current.map((b) => {
    if (b.id === bookingId || b.code === bookingId) {
      return {
        ...b,
        assignedEmployee: employeeName,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    fetch("/api/bookings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bookingId,
        assignedEmployee: employeeName,
      }),
    }).catch(() => {});
  }

  return updated;
}

// Helper: Delete booking
export function deleteBooking(bookingId: string): AdminBooking[] {
  const current = getStoredBookings();
  const updated = current.filter((b) => b.id !== bookingId && b.code !== bookingId);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    // Asynchronously delete in MongoDB backend
    fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, {
      method: "DELETE",
    }).catch(() => {});
  }

  return updated;
}

// Helper: Get Expenses
export function getStoredExpenses(): ExpenseItem[] {
  if (typeof window === "undefined") return INITIAL_DEMO_EXPENSES;
  ensureCleanStartMigration();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

// Helper: Add Expense
export function saveExpense(expense: Omit<ExpenseItem, "id" | "time"> & { date?: string; time?: string }): ExpenseItem {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const time = expense.time || `${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? "PM" : "AM"}`;
  const todayIso = now.toISOString().slice(0, 10);
  const expenseDate = expense.date || todayIso;

  const newExpense: ExpenseItem = {
    ...expense,
    id: `exp-${Date.now()}`,
    date: expenseDate,
    time,
    createdAt: now.toISOString(),
  };

  const current = getStoredExpenses();
  const updated = [newExpense, ...current];

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(updated));
    // Asynchronously post to MongoDB backend
    fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense),
    }).catch(() => {});
  }

  return newExpense;
}

// Helper: Sync with MongoDB backend
export async function syncWithBackend(): Promise<{ bookings: AdminBooking[]; expenses: ExpenseItem[] }> {
  try {
    const [resB, resE] = await Promise.all([
      fetch("/api/bookings"),
      fetch("/api/expenses"),
    ]);

    const dataB = await resB.json();
    const dataE = await resE.json();

    let bookings = getStoredBookings();
    if (dataB.success && Array.isArray(dataB.bookings)) {
      const serverMap = new Map<string, any>();
      for (const sb of dataB.bookings) {
        if (sb.code) serverMap.set(sb.code, sb);
        if (sb.id) serverMap.set(sb.id, sb);
      }

      // Preserve recent locally saved bookings (created in the last 60 seconds)
      // that may not yet be reflected in the MongoDB query due to network latency
      const recentLocal = bookings.filter((localB) => {
        if (serverMap.has(localB.code) || serverMap.has(localB.id)) return false;
        const createdMs = new Date(localB.createdAt || 0).getTime();
        const ageMs = Date.now() - createdMs;
        return ageMs < 60000;
      });

      bookings = [...recentLocal, ...dataB.bookings];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
      }
    }

    let expenses = getStoredExpenses();
    if (dataE.success && Array.isArray(dataE.expenses)) {
      const serverMap = new Map<string, any>();
      for (const se of dataE.expenses) {
        if (se.id) serverMap.set(se.id, se);
      }
      const recentLocal = expenses.filter((localE) => {
        if (serverMap.has(localE.id)) return false;
        const createdMs = new Date(localE.createdAt || 0).getTime();
        const ageMs = Date.now() - createdMs;
        return ageMs < 60000;
      });

      expenses = [...recentLocal, ...dataE.expenses];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
      }
    }

    return { bookings, expenses };
  } catch {
    return { bookings: getStoredBookings(), expenses: getStoredExpenses() };
  }
}

// Helper: WhatsApp Ready Notification Message Link
export function createWhatsAppReadyLink(booking: AdminBooking): string {
  const cleanPhone = booking.clientPhone.replace(/\D/g, "");
  // Default to Colombia +57 if 10 digits
  const phone = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;

  const message = encodeURIComponent(
    `¡Hola ${booking.clientName}! 🚗✨\n\n` +
    `Te informamos desde *Exclusive AutoWash & Detailing Studio* que tu vehículo ya está listo para retiro:\n\n` +
    `📋 *Placa:* ${booking.licensePlate.toUpperCase()}\n` +
    `🧼 *Servicio:* ${booking.serviceName}\n` +
    `🏷️ *Código:* ${booking.code}\n` +
    `💰 *Total a Cancelar:* ${formatCurrency(booking.price)} (${booking.isPaid ? "✅ PAGADO" : "⏳ PENDIENTE DE PAGO"})\n\n` +
    `Puedes pasar a retirarlo en nuestra bahía de entrega. ¡Gracias por confiar en nosotros!`
  );

  return `https://wa.me/${phone}?text=${message}`;
}

// Helper: WhatsApp Receipt Link
export function createWhatsAppReceiptLink(booking: AdminBooking | any, hideFinancials?: boolean): string {
  const cleanPhone = (booking.clientPhone || "").replace(/\D/g, "");
  // Default to Colombia +57 if 10 digits
  const phone = cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone;

  const financialLines = hideFinancials
    ? `📋 *Estado:* ${booking.stage === 5 ? "✅ ENTREGADO" : "🚿 EN SERVICIO TÉCNICO"}\n\n`
    : `💳 *Método de Pago:* ${(booking.paymentMethod || "Efectivo").toUpperCase()}\n` +
      `💰 *Total:* ${formatCurrency(booking.price || 0)} (${booking.isPaid ? "✅ PAGADO" : "⏳ PENDIENTE DE PAGO"})\n\n`;

  const message = encodeURIComponent(
    `🧾 *COMPROBANTE DE SERVICIO - EXCLUSIVE AUTOWASH*\n` +
    `-----------------------------------------\n` +
    `Hola ${booking.clientName || "Cliente"}, aquí tienes el comprobante de tu servicio:\n\n` +
    `🏷️ *Comprobante N°:* REC-${booking.code || "001"}\n` +
    `🚘 *Placa:* ${(booking.licensePlate || "").toUpperCase()}\n` +
    `✨ *Vehículo:* ${(booking.vehicleType || "Automóvil").toUpperCase()}\n` +
    `🧼 *Servicio:* ${booking.serviceName || "Lavado Premium"}\n` +
    `📍 *Bahía:* ${booking.bay || "Bahía 1"}\n` +
    `👤 *Lavador / Técnico:* ${booking.assignedEmployee || "Equipo Técnico Exclusive"}\n` +
    `📅 *Fecha:* ${booking.day || "Hoy"} - ${booking.time || "En curso"}\n` +
    financialLines +
    `🌐 *Rastreo en vivo de tu vehículo:* https://exclusive-autowash.com?placa=${(booking.licensePlate || "").toUpperCase()}\n` +
    `-----------------------------------------\n` +
    `¡Gracias por confiar en Exclusive AutoWash & Detailing Studio!`
  );

  return `https://wa.me/${phone}?text=${message}`;
}
