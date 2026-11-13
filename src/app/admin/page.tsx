"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AdminBooking,
  BookingStage,
  ExpenseItem,
  STAGE_CONFIG,
  DEFAULT_EMPLOYEES,
  getStoredEmployees,
  syncEmployeesWithBackend,
  getStoredBookings,
  updateBookingStage,
  updateBookingPayment,
  updateBookingEmployee,
  deleteBooking,
  getStoredExpenses,
  createWhatsAppReadyLink,
  syncWithBackend,
  getPromoEnabled,
  setPromoEnabled,
  getSlotsForDate,
  saveSlotsConfiguration,
  generateIntervalSlots,
  formatTo12HourSlot,
  getSlotCapacity,
  setSlotCapacity,
} from "@/data/adminStore";
import { formatCurrency, TIME_SLOTS, VehicleType } from "@/data/servicesData";
import {
  DetailingProduct,
  PREMIUM_PRODUCTS,
  getStoredProducts,
  deleteStoredProduct,
  resetDefaultProducts,
  syncProductsWithBackend,
} from "@/data/productsData";
import ExpressWalkInModal from "@/components/admin/ExpressWalkInModal";
import AddExpenseModal from "@/components/admin/AddExpenseModal";
import CustomerReceiptModal from "@/components/admin/CustomerReceiptModal";
import ChangePasswordModal from "@/components/admin/ChangePasswordModal";
import ProductFormModal from "@/components/admin/ProductFormModal";
import ManageEmployeesModal from "@/components/admin/ManageEmployeesModal";
import {
  Car,
  Truck,
  Bike,
  PlusCircle,
  Receipt,
  Search,
  CheckCircle,
  Clock,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  Sparkles,
  Droplets,
  Layers,
  Phone,
  User,
  Users,
  Radio,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  LogOut,
  Check,
  UserCheck,
  FlaskConical,
  Edit3,
  Upload,
  Tag,
  ChevronDown,
} from "lucide-react";

export default function AdminDashboardPage() {
  // Authentication states (Username & Password)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [currentAdmin, setCurrentAdmin] = useState<{ username: string; role: string; canViewFinancials: boolean } | null>(null);
  const canViewFinancials = currentAdmin ? currentAdmin.canViewFinancials : true;
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);

  // Data states
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [products, setProducts] = useState<DetailingProduct[]>(PREMIUM_PRODUCTS);
  const [searchPlate, setSearchPlate] = useState<string>("");
  const [selectedFilterStage, setSelectedFilterStage] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<"kanban" | "table" | "caja" | "agenda" | "productos">("kanban");
  const [tableCurrentPage, setTableCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // Modals
  const [isWalkInOpen, setIsWalkInOpen] = useState<boolean>(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState<boolean>(false);
  const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState<boolean>(false);
  const [employeesList, setEmployeesList] = useState<string[]>(DEFAULT_EMPLOYEES);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<DetailingProduct | null>(null);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<AdminBooking | null>(null);
  const [mobileKanbanStage, setMobileKanbanStage] = useState<number | "todos">("todos");

  // Time slots blocked state (for capacity management)
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [isPromoEnabled, setIsPromoEnabledState] = useState<boolean>(true);
  const [agendaSlots, setAgendaSlots] = useState<Array<{ time: string; available: boolean }>>(TIME_SLOTS);
  const [slotCapacity, setSlotCapacityState] = useState<number>(1);
  const [newManualTime, setNewManualTime] = useState<string>("08:30");
  const [applyScheduleAllDays, setApplyScheduleAllDays] = useState<boolean>(true);
  const [scheduleNotice, setScheduleNotice] = useState<string>("");

  // Date filter state: "todos" | "hoy" | "ayer" | "semana" | "mes" | "custom"
  const [dateFilterPreset, setDateFilterPreset] = useState<"todos" | "hoy" | "ayer" | "semana" | "mes" | "custom">("todos");
  const [selectedCustomDate, setSelectedCustomDate] = useState<string>("");

  // Agenda / Capacity management date (hydrated in useEffect)
  const [todayIso, setTodayIso] = useState<string>("2026-10-20");
  const [agendaDate, setAgendaDate] = useState<string>("2026-10-20");
  const [agendaUpcomingDays, setAgendaUpcomingDays] = useState<
    Array<{ isoStr: string; dayLabel: string; dateNum: number | string; monthName: string }>
  >([]);

  // Check auth session on mount & initialize dates
  useEffect(() => {
    let today = "";
    try {
      today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
    } catch {
      today = new Date().toISOString().slice(0, 10);
    }
    setTodayIso(today);
    setAgendaDate(today);

    // Compute upcoming 14 days for agenda
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const days = Array.from({ length: 14 }).map((_, index) => {
      const d = new Date();
      d.setDate(d.getDate() + index);
      return {
        isoStr: d.toISOString().slice(0, 10),
        dayLabel: index === 0 ? "Hoy" : index === 1 ? "Mañana" : dayNames[d.getDay()],
        dateNum: d.getDate(),
        monthName: monthNames[d.getMonth()],
      };
    });
    setAgendaUpcomingDays(days);

    const savedAuth = sessionStorage.getItem("exclusive_admin_auth") || localStorage.getItem("exclusive_admin_auth");
    const savedUser = sessionStorage.getItem("exclusive_admin_user") || localStorage.getItem("exclusive_admin_user");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          const hasFin = parsed.canViewFinancials ?? (parsed.username === "admin" || parsed.role?.toLowerCase().includes("director") || parsed.role?.toLowerCase().includes("administrador"));
          setCurrentAdmin({
            username: parsed.username || "admin",
            role: parsed.role || "Director General",
            canViewFinancials: hasFin,
          });
        } catch {
          setCurrentAdmin({ username: "admin", role: "Director General", canViewFinancials: true });
        }
      } else {
        setCurrentAdmin({ username: "admin", role: "Director General", canViewFinancials: true });
      }
    }
  }, []);

  // Countdown timer for lockout after multiple failed attempts
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Load bookings, expenses and products
  const refreshData = () => {
    const b = getStoredBookings();
    const e = getStoredExpenses();
    const p = getStoredProducts();
    const emp = getStoredEmployees();
    setBookings(b);
    setExpenses(e);
    setProducts(p);
    setEmployeesList(emp);
    setIsPromoEnabledState(getPromoEnabled());
    setSlotCapacityState(getSlotCapacity());
    setAgendaSlots(getSlotsForDate(agendaDate));

    try {
      const blocked = JSON.parse(localStorage.getItem("exclusive_blocked_slots") || "[]");
      setBlockedSlots(blocked);
    } catch {
      // ignore
    }

    // Background sync with MongoDB
    syncWithBackend()
      .then(({ bookings: freshB, expenses: freshE }) => {
        setBookings(freshB);
        setExpenses(freshE);
      })
      .catch(() => {});

    syncProductsWithBackend()
      .then((freshP) => setProducts(freshP))
      .catch(() => {});

    syncEmployeesWithBackend()
      .then((freshEmp) => setEmployeesList(freshEmp))
      .catch(() => {});
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(() => {
        syncWithBackend()
          .then(({ bookings: freshB, expenses: freshE }) => {
            setBookings(freshB);
            setExpenses(freshE);
          })
          .catch(() => {});
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setAgendaSlots(getSlotsForDate(agendaDate));
  }, [agendaDate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) {
      setAuthError(`Sistema temporalmente bloqueado. Espera ${lockoutSeconds}s antes de reintentar.`);
      return;
    }

    const userClean = usernameInput.trim().toLowerCase();
    const passClean = passwordInput.trim();

    if (!userClean || !passClean) {
      setAuthError("Por favor ingresa tanto usuario como contraseña.");
      return;
    }

    // 1. Check custom credentials saved via "Cambiar Contraseña"
    let customCreds: { username: string; password: string } | null = null;
    try {
      const stored = localStorage.getItem("exclusive_admin_custom_creds");
      if (stored) customCreds = JSON.parse(stored);
    } catch {
      // ignore
    }

    let isValid = false;
    let userRole = "Director General & Finanzas";
    let canViewFinancialsRole = true;

    if (customCreds && userClean === customCreds.username.toLowerCase() && passClean === customCreds.password) {
      isValid = true;
      userRole = "Administrador Principal";
      canViewFinancialsRole = true;
    } else {
      // 2. Validate via Server-Side API (Environment Variables protected)
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: userClean, password: passClean }),
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          isValid = true;
          userRole = data.user.role;
          canViewFinancialsRole = Boolean(data.user.canViewFinancials);
        }
      } catch (err) {
        // Fallback in case of network issue
        const isAdminUser =
          userClean === "exclusivespa_admin" ||
          userClean === "exclusivespaadmin" ||
          userClean === "exclusivespafinanzas" ||
          userClean === "exclusivespa_finanzas";
        const isWorkerUser =
          userClean === "exclusivespa_trabajador" ||
          userClean === "exclusivespatrabajador" ||
          userClean === "exclusivespa_operador" ||
          userClean === "exclusivespaoperador";

        if (isAdminUser && passClean === "admin1234*") {
          isValid = true;
          userRole = "Director General & Finanzas";
          canViewFinancialsRole = true;
        } else if (isWorkerUser && passClean === "trabajo1234*") {
          isValid = true;
          userRole = "Operador de Bahías & Taller";
          canViewFinancialsRole = false;
        }
      }
    }

    if (isValid) {
      const adminInfo = { username: userClean, role: userRole, canViewFinancials: canViewFinancialsRole };
      setIsAuthenticated(true);
      setCurrentAdmin(adminInfo);
      setAuthError("");
      setFailedAttempts(0);
      setPasswordInput("");

      sessionStorage.setItem("exclusive_admin_auth", "true");
      sessionStorage.setItem("exclusive_admin_user", JSON.stringify(adminInfo));

      if (rememberMe) {
        localStorage.setItem("exclusive_admin_auth", "true");
        localStorage.setItem("exclusive_admin_user", JSON.stringify(adminInfo));
      }
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutSeconds(30);
        setAuthError("Demasiados intentos incorrectos. Acceso bloqueado por seguridad durante 30 segundos.");
      } else {
        setAuthError(`Usuario o contraseña incorrectos (${5 - newAttempts} intentos restantes).`);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("exclusive_admin_auth");
    sessionStorage.removeItem("exclusive_admin_user");
    localStorage.removeItem("exclusive_admin_auth");
    localStorage.removeItem("exclusive_admin_user");
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    setPasswordInput("");
    setAuthError("");
  };

  // If user role does not have financial privileges, prevent access to caja or productos tab
  useEffect(() => {
    if (!canViewFinancials && (activeTab === "caja" || activeTab === "productos")) {
      setActiveTab("kanban");
    }
  }, [canViewFinancials, activeTab]);

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${productName}" del catálogo web?`)) {
      const updated = deleteStoredProduct(productId);
      setProducts(updated);
    }
  };

  const handleResetProducts = () => {
    if (confirm("¿Restaurar los 6 productos base originales del catálogo?")) {
      const updated = resetDefaultProducts();
      setProducts(updated);
    }
  };

  // Stage advancement
  const handleAdvanceStage = (bookingId: string, currentStage: BookingStage) => {
    if (currentStage >= 5) return;
    const nextStage = (currentStage + 1) as BookingStage;
    const currentBooking = bookings.find((b) => b.id === bookingId || b.code === bookingId);
    const updated = updateBookingStage(
      bookingId,
      nextStage,
      currentBooking?.bay,
      currentBooking?.isPaid,
      currentBooking?.paymentMethod,
      currentBooking?.assignedEmployee
    );
    setBookings(updated);
  };

  // Change stage directly
  const handleChangeStage = (bookingId: string, targetStage: BookingStage) => {
    const currentBooking = bookings.find((b) => b.id === bookingId || b.code === bookingId);
    const updated = updateBookingStage(
      bookingId,
      targetStage,
      currentBooking?.bay,
      currentBooking?.isPaid,
      currentBooking?.paymentMethod,
      currentBooking?.assignedEmployee
    );
    setBookings(updated);
  };

  // Toggle paid status
  const handleTogglePaid = (booking: AdminBooking) => {
    const nextPaid = !booking.isPaid;
    const nextMethod = nextPaid ? (booking.paymentMethod && booking.paymentMethod !== "pendiente" ? booking.paymentMethod : "efectivo") : "pendiente";
    const updated = updateBookingPayment(booking.id, nextMethod, nextPaid);
    setBookings(updated);
  };

  // Change payment method directly
  const handleChangePaymentMethod = (bookingId: string, method: AdminBooking["paymentMethod"]) => {
    const willBePaid = method !== "pendiente";
    const updated = updateBookingPayment(bookingId, method, willBePaid);
    setBookings(updated);
  };

  // Delete booking
  const handleDeleteBooking = (bookingId: string) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      const updated = deleteBooking(bookingId);
      setBookings(updated);
    }
  };

  // Assign employee/detailer to a booking
  const handleAssignEmployee = (bookingId: string, employeeName: string) => {
    const updated = updateBookingEmployee(bookingId, employeeName);
    setBookings(updated);
  };

  // Receipt update handler (e.g. payment status toggled in receipt)
  const handleUpdateBookingFromReceipt = (updated: AdminBooking) => {
    const current = getStoredBookings();
    const index = current.findIndex((b) => b.id === updated.id);
    if (index !== -1) {
      current[index] = updated;
      if (typeof window !== "undefined") {
        localStorage.setItem("exclusive_admin_bookings", JSON.stringify(current));
      }
      setBookings([...current]);
      setSelectedReceiptBooking(updated);
    }
  };

  // Toggle blocked slot (supports date-specific key or global slot)
  const handleToggleSlot = (time: string, dateStr?: string) => {
    const key = dateStr ? `${dateStr}_${time}` : time;
    let updated: string[];
    if (blockedSlots.includes(key)) {
      updated = blockedSlots.filter((t) => t !== key);
    } else {
      updated = [...blockedSlots, key];
    }
    setBlockedSlots(updated);
    localStorage.setItem("exclusive_blocked_slots", JSON.stringify(updated));
    window.dispatchEvent(new Event("exclusive_schedule_changed"));
  };

  const showTempScheduleNotice = (msg: string) => {
    setScheduleNotice(msg);
    setTimeout(() => setScheduleNotice(""), 3200);
  };

  // Add a custom manual hour (e.g. "08:20 AM")
  const handleAddManualSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatTo12HourSlot(newManualTime);
    if (!formatted) {
      showTempScheduleNotice("Formato de hora inválido. Usa el selector de hora.");
      return;
    }
    const currentList = agendaSlots.map((s) => s.time);
    if (currentList.includes(formatted)) {
      showTempScheduleNotice(`El horario ${formatted} ya existe en la lista.`);
      return;
    }
    const saved = saveSlotsConfiguration(
      [...currentList, formatted],
      agendaDate,
      applyScheduleAllDays
    );
    setAgendaSlots(saved.map((time) => ({ time, available: true })));
    showTempScheduleNotice(
      `Horario ${formatted} agregado ${applyScheduleAllDays ? "a todos los días" : `para ${agendaDate}`}.`
    );
  };

  // Remove a specific hour slot
  const handleRemoveSlot = (timeToRemove: string) => {
    const currentList = agendaSlots.map((s) => s.time).filter((t) => t !== timeToRemove);
    if (currentList.length === 0) {
      showTempScheduleNotice("Debe quedar al menos 1 horario configurado.");
      return;
    }
    const saved = saveSlotsConfiguration(currentList, agendaDate, applyScheduleAllDays);
    setAgendaSlots(saved.map((time) => ({ time, available: true })));
    showTempScheduleNotice(`Horario ${timeToRemove} eliminado.`);
  };

  // Apply quick interval preset (20m, 30m, 45m, 60m)
  const handleApplyIntervalPreset = (interval: 20 | 30 | 45 | 60) => {
    const generated =
      interval === 60
        ? TIME_SLOTS.map((s) => s.time)
        : generateIntervalSlots(interval, 8, 18);
    const saved = saveSlotsConfiguration(generated, agendaDate, applyScheduleAllDays);
    setAgendaSlots(saved.map((time) => ({ time, available: true })));
    showTempScheduleNotice(
      `Parrilla ajustada cada ${interval} min (${saved.length} horarios) ${
        applyScheduleAllDays ? "para todos los días" : `para ${agendaDate}`
      }.`
    );
  };

  // Block or Unblock all slots of the currently selected agendaDate
  const handleBlockOrUnblockAllDay = (blockAll: boolean) => {
    const dayKeys = agendaSlots.map((s) => `${agendaDate}_${s.time}`);
    let updated: string[];
    if (blockAll) {
      updated = Array.from(new Set([...blockedSlots, ...dayKeys]));
    } else {
      updated = blockedSlots.filter((k) => !dayKeys.includes(k) && !agendaSlots.some((s) => s.time === k));
    }
    setBlockedSlots(updated);
    localStorage.setItem("exclusive_blocked_slots", JSON.stringify(updated));
    window.dispatchEvent(new Event("exclusive_schedule_changed"));
    showTempScheduleNotice(
      blockAll
        ? `Todos los horarios del ${agendaDate} fueron pausados/bloqueados.`
        : `Todos los horarios del ${agendaDate} fueron liberados.`
    );
  };

  // Change simultaneous vehicle capacity per slot (1, 2 or 3 bays)
  const handleChangeSlotCapacity = (cap: number) => {
    const saved = setSlotCapacity(cap);
    setSlotCapacityState(saved);
    showTempScheduleNotice(
      `Capacidad simultánea actualizada a ${saved} ${saved === 1 ? "vehículo" : "vehículos"} por turno.`
    );
  };

  // Helper to test if an ISO date or day matches the active date filter
  const matchesDateFilter = (isoDateOrCreatedAt?: string, dayLabel?: string, appointmentDate?: string) => {
    if (dateFilterPreset === "todos") return true;

    let itemDate = appointmentDate || "";
    if (!itemDate && isoDateOrCreatedAt) {
      itemDate = isoDateOrCreatedAt.slice(0, 10);
    }
    if (!itemDate && dayLabel?.toLowerCase().includes("hoy")) {
      itemDate = todayIso;
    }

    if (dateFilterPreset === "custom") {
      if (!selectedCustomDate) return true;
      return itemDate === selectedCustomDate;
    }

    if (dateFilterPreset === "hoy") {
      return itemDate === todayIso || dayLabel?.toLowerCase().includes("hoy");
    }

    if (dateFilterPreset === "ayer") {
      if (!itemDate) return true;
      const [y, m, d] = todayIso.split("-").map(Number);
      const yesterdayObj = new Date(Date.UTC(y, m - 1, d - 1));
      const yesterdayIso = yesterdayObj.toISOString().slice(0, 10);
      return itemDate === yesterdayIso || dayLabel?.toLowerCase().includes("ayer");
    }

    if (dateFilterPreset === "semana") {
      if (!itemDate) return true;
      const [y, m, d] = todayIso.split("-").map(Number);
      const todayTime = Date.UTC(y, m - 1, d);
      const itemParts = itemDate.split("-").map(Number);
      const itemTime = Date.UTC(itemParts[0], (itemParts[1] || 1) - 1, itemParts[2] || 1);
      const sevenDaysAgo = todayTime - 7 * 24 * 60 * 60 * 1000;
      const nextSevenDays = todayTime + 7 * 24 * 60 * 60 * 1000;
      return itemTime >= sevenDaysAgo && itemTime <= nextSevenDays;
    }

    if (dateFilterPreset === "mes") {
      if (!itemDate) return true;
      const currentYearMonth = todayIso.slice(0, 7);
      return itemDate.startsWith(currentYearMonth);
    }

    return true;
  };

  // Filtered bookings for Kanban and Table view
  const filteredBookings = bookings.filter((b) => {
    const matchesPlate = b.licensePlate.toUpperCase().includes(searchPlate.trim().toUpperCase());
    const matchesStage =
      selectedFilterStage === "todos" || b.stage.toString() === selectedFilterStage;
    const matchesDate = matchesDateFilter(b.createdAt, b.day, b.appointmentDate);
    return matchesPlate && matchesStage && matchesDate;
  });

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setTableCurrentPage(1);
  }, [searchPlate, selectedFilterStage, dateFilterPreset, selectedCustomDate]);

  // Dynamic Pagination calculations for Vehicle List Table
  const totalTablePages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const safeTablePage = Math.min(tableCurrentPage, totalTablePages);
  const tableStartIndex = (safeTablePage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(
    tableStartIndex,
    tableStartIndex + itemsPerPage
  );

  // Filtered Expenses for Caja and Financial metrics
  const filteredExpenses = expenses.filter((e) => {
    return matchesDateFilter(e.createdAt || e.date, e.date);
  });

  // Calculations & KPIs (Reactive to Date Filter!)
  const totalBookingsCount = filteredBookings.length;
  const inBayCount = filteredBookings.filter((b) => b.stage === 2 || b.stage === 3).length;
  const readyCount = filteredBookings.filter((b) => b.stage === 4).length;
  const deliveredCount = filteredBookings.filter((b) => b.stage === 5).length;

  // Gross Income (based on date-filtered bookings)
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.price, 0);
  const totalPaidRevenue = filteredBookings.filter((b) => b.isPaid).reduce((sum, b) => sum + b.price, 0);
  const totalPendingRevenue = filteredBookings.filter((b) => !b.isPaid).reduce((sum, b) => sum + b.price, 0);

  // Total Expenses (based on date-filtered expenses)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalPaidRevenue - totalExpenses;

  // Payment method breakdown (based on date-filtered bookings)
  const paymentBreakdown = {
    efectivo: filteredBookings.filter((b) => b.paymentMethod === "efectivo" && b.isPaid).reduce((s, b) => s + b.price, 0),
    nequi: filteredBookings.filter((b) => b.paymentMethod === "nequi" && b.isPaid).reduce((s, b) => s + b.price, 0),
    daviplata: filteredBookings.filter((b) => b.paymentMethod === "daviplata" && b.isPaid).reduce((s, b) => s + b.price, 0),
    tarjeta: filteredBookings.filter((b) => b.paymentMethod === "tarjeta" && b.isPaid).reduce((s, b) => s + b.price, 0),
  };

  // --- 1. SECURE USER & PASSWORD LOGIN GATEWAY ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black" suppressHydrationWarning>
        <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-white/12 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand & Security Header */}
          <div className="text-center space-y-3 mb-6 relative">
            <div className="flex justify-center mb-1">
              <Image
                src="/images/logo.png?v=4"
                alt="Exclusive Detallado de Vehículos"
                width={210}
                height={55}
                priority
                unoptimized
                className="h-12 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Acceso Seguro Encriptado</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Portal Administrativo</h1>
              <p className="text-xs text-slate-400 mt-1">
                Exclusive AutoWash & Detailing Studio • Bahías & Caja
              </p>
            </div>
          </div>

          {/* Error / Lockout Alert */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              {lockoutSeconds > 0 ? (
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">{authError}</span>
                {lockoutSeconds > 0 && (
                  <span className="text-[11px] text-rose-400/80 block mt-1">
                    Tiempo de espera: <strong className="font-mono text-white">{lockoutSeconds} segundos</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="text-[11px] uppercase font-extrabold tracking-wider text-slate-300 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Usuario o Correo</span>
                </span>
                <span className="text-[10px] text-slate-500 font-normal">admin</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  required
                  disabled={lockoutSeconds > 0}
                  placeholder="admin o correo institucional"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-[11px] uppercase font-extrabold tracking-wider text-slate-300 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Contraseña</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={lockoutSeconds > 0}
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600 pr-10 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-black/50 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0 accent-cyan-500"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  Recordar sesión en este equipo
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={lockoutSeconds > 0}
              className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Unlock className="w-4 h-4" />
              <span>{lockoutSeconds > 0 ? `Bloqueado (${lockoutSeconds}s)` : "Iniciar Sesión"}</span>
            </button>

            {/* Security Guarantee & Back Link */}
            <div className="pt-2 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  TLS 1.3 / SSL 256-bit
                </span>
                <span>•</span>
                <span>Sesión Aislada</span>
              </div>

              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
              >
                <span>Volver a la Página Principal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black" suppressHydrationWarning>
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-[140px] pointer-events-none z-0" />

      {/* TOP ADMIN HEADER (Clean Executive Layout) */}
      <header className="sticky top-0 z-40 bg-[#080c14]/95 border-b border-white/10 backdrop-blur-xl px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Brand Logo & Compact Status */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0" title="Ir a la página principal">
                <Image
                  src="/images/logo.png?v=4"
                  alt="Exclusive Detallado de Vehículos"
                  width={155}
                  height={44}
                  priority
                  unoptimized
                  className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
                />
              </Link>
            </div>

            {/* Mobile Profile Trigger (Shown on mobile top-right) */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={refreshData}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-bold text-white"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentAdmin?.username || "admin"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right: Streamlined Operational Actions & Unified User Dropdown */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 w-full md:w-auto">
            {canViewFinancials && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isPromoEnabled;
                    setPromoEnabled(nextState);
                    setIsPromoEnabledState(nextState);
                  }}
                  className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isPromoEnabled
                      ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                      : "bg-white/5 hover:bg-white/10 text-slate-400 border-white/15"
                  }`}
                  title={
                    isPromoEnabled
                      ? "Bono 15% OFF Activo (Clic para desactivar)"
                      : "Bono 15% OFF Desactivado (Clic para activar)"
                  }
                >
                  <Tag className={`w-3.5 h-3.5 shrink-0 ${isPromoEnabled ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{isPromoEnabled ? "15% OFF: Activo" : "15% OFF: Inactivo"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(true)}
                  className="h-10 px-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-rose-300 border border-rose-500/20 hover:border-rose-400/40 transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>- Gasto Caja</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEmployeesModalOpen(true)}
                  className="h-10 px-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/25 hover:border-cyan-400/40 transition-all inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  title="Gestionar lista de lavadores y operarios"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>👥 Lavadores ({employeesList.length})</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsWalkInOpen(true)}
              className="flex-1 sm:flex-initial h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>+ Ingreso sin Cita</span>
            </button>

            {/* Unified Profile & Settings Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="hidden md:inline-flex items-center gap-2.5 h-10 pl-2.5 pr-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs transition-all whitespace-nowrap cursor-pointer"
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    canViewFinancials
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  }`}
                >
                  {canViewFinancials ? "👑" : "🛠️"}
                </span>
                <span className="font-bold text-white">{currentAdmin?.username || "admin"}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {canViewFinancials ? "Admin" : "Operador"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isProfileMenuOpen ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0b101b] border border-white/15 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-extrabold text-white">
                        {currentAdmin?.username || "admin"}
                      </p>
                      <p className="text-[11px] text-cyan-400 font-medium">
                        {currentAdmin?.role || (canViewFinancials ? "Director General" : "Operador")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        refreshData();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sincronizar / Actualizar Datos</span>
                    </button>

                    {canViewFinancials && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsEmployeesModalOpen(true);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Gestionar Lavadores ({employeesList.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setEditingProduct(null);
                            setActiveTab("productos");
                            setIsProductModalOpen(true);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Subir Nuevo Producto</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cambiar Usuario / Contraseña</span>
                    </button>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] flex items-center gap-2.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      <span>Abrir Web de Clientes</span>
                    </Link>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión Segura</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 relative z-10">
        
        {/* 1. EXECUTIVE KPI METRICS STRIP */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Vehículos Filtrados */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-400">
                {dateFilterPreset === "todos"
                  ? "Vehículos (Total)"
                  : dateFilterPreset === "hoy"
                  ? "Vehículos Hoy"
                  : dateFilterPreset === "ayer"
                  ? "Vehículos Ayer"
                  : dateFilterPreset === "semana"
                  ? "Vehículos Esta Semana"
                  : dateFilterPreset === "mes"
                  ? "Vehículos Este Mes"
                  : `Vehículos (${selectedCustomDate})`}
              </span>
              <Car className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{totalBookingsCount}</span>
              <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold truncate">
                {deliveredCount} entregados
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400">
              <span>{inBayCount} en bahía</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{readyCount} listos</span>
            </div>
          </div>

          {canViewFinancials ? (
            <>
              {/* Card 2: Ingresos Brutos Filtrados */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-400">
                    {dateFilterPreset === "todos" ? "Ingresos Totales" : "Ingresos del Período"}
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="mt-2">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-black text-white truncate block">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-emerald-400 font-semibold truncate">
                    Cobrado: {formatCurrency(totalPaidRevenue)}
                  </span>
                </div>
              </div>

              {/* Card 3: Gastos de Caja Menor Filtrados */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-400">
                    {dateFilterPreset === "todos" ? "Gastos Registrados" : "Gastos del Período"}
                  </span>
                  <Receipt className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
                <div className="mt-2">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-black text-rose-400 truncate block">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 truncate">
                  <span>{filteredExpenses.length} salidas de dinero</span>
                </div>
              </div>

              {/* Card 4: Ganancia Neta de Caja */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-blue-950/40 border border-cyan-500/20 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-cyan-300">Balance Neto</span>
                  <DollarSign className="w-4 h-4 text-cyan-400 shrink-0" />
                </div>
                <div className="mt-2">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-black text-cyan-400 truncate block">
                    {formatCurrency(netProfit)}
                  </span>
                </div>
                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-300 truncate">
                  <span>Disponible en caja</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Operator Card 2: Ocupación de Bahías */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-400">
                    Ocupación Bahías
                  </span>
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white">{inBayCount} / 4</span>
                  <span className="text-[10px] sm:text-xs text-cyan-300 font-semibold truncate">
                    bahías activas
                  </span>
                </div>
                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 truncate">
                  <span>Lavado, Secado y Detallado</span>
                </div>
              </div>

              {/* Operator Card 3: En Proceso Técnico */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-400">
                    En Proceso Técnico
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-400">
                    {filteredBookings.filter((b) => b.stage === 2 || b.stage === 3).length}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 font-semibold truncate">
                    en lavado / secado
                  </span>
                </div>
                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400 truncate">
                  <span>Supervisión continua</span>
                </div>
              </div>

              {/* Operator Card 4: Listos para Entrega */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-cyan-950/40 border border-emerald-500/20 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-emerald-300">
                    Listos para Retiro
                  </span>
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400">{readyCount}</span>
                  <span className="text-[10px] sm:text-xs text-emerald-300 font-semibold truncate">
                    esperando cliente
                  </span>
                </div>
                <div className="mt-2 text-[10px] sm:text-[11px] text-slate-300 truncate">
                  <span>Avisar por WhatsApp</span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* 2. DATE & HISTORICAL SEARCH TOOLBAR */}
        <section className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mr-1">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Filtrar Historial:</span>
            </div>

            {/* Quick Filter Presets */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              {(
                [
                  { id: "todos", label: "Todo el Historial" },
                  { id: "hoy", label: "Hoy" },
                  { id: "ayer", label: "Ayer" },
                  { id: "semana", label: "Esta Semana" },
                  { id: "mes", label: "Este Mes" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setDateFilterPreset(preset.id);
                    setSelectedCustomDate("");
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    dateFilterPreset === preset.id
                      ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Specific Date Picker */}
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  type="date"
                  value={selectedCustomDate}
                  onChange={(e) => {
                    setSelectedCustomDate(e.target.value);
                    if (e.target.value) {
                      setDateFilterPreset("custom");
                    } else {
                      setDateFilterPreset("todos");
                    }
                  }}
                  className={`px-3 py-1 rounded-xl border text-xs focus:outline-none transition-all ${
                    dateFilterPreset === "custom"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400"
                      : "bg-black/40 border-white/10 text-slate-300 hover:border-slate-600"
                  }`}
                  title="Seleccionar una fecha específica"
                />
              </div>

              {dateFilterPreset !== "todos" && (
                <button
                  onClick={() => {
                    setDateFilterPreset("todos");
                    setSelectedCustomDate("");
                  }}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  title="Restablecer filtro de fecha"
                >
                  ✕ Quitar Filtro
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Metrics Indicator */}
          <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
            <span>
              Vehículos encontrados: <strong className="text-cyan-400 font-mono">{filteredBookings.length}</strong>
              {bookings.length > filteredBookings.length && (
                <span className="text-amber-300 ml-1.5 font-semibold">
                  ({bookings.length - filteredBookings.length} turnos en otras fechas o estados)
                </span>
              )}
            </span>

            {bookings.length > filteredBookings.length && (
              <button
                type="button"
                onClick={() => {
                  setDateFilterPreset("todos");
                  setSelectedCustomDate("");
                  setSelectedFilterStage("todos");
                  setSearchPlate("");
                }}
                className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-all cursor-pointer"
              >
                Mostrar todos los {bookings.length} turnos
              </button>
            )}

            {canViewFinancials && (
              <>
                <span>•</span>
                <span>
                  Gastos encontrados: <strong className="text-rose-400 font-mono">{filteredExpenses.length}</strong>
                </span>
              </>
            )}
          </div>
        </section>

        {/* 3. TAB CONTROLS (Kanban / Tabla / Caja / Agenda) */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("kanban")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === "kanban"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bahías (Kanban)</span>
            </button>

            <button
              onClick={() => setActiveTab("table")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === "table"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Lista Vehículos ({filteredBookings.length})</span>
            </button>

            {canViewFinancials && (
              <>
                <button
                  onClick={() => setActiveTab("caja")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    activeTab === "caja"
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Contabilidad & Caja</span>
                </button>

                <button
                  onClick={() => setActiveTab("productos")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                    activeTab === "productos"
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Productos & Precios ({products.length})</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab("agenda")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                activeTab === "agenda"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Cupos de Horario</span>
            </button>
          </div>

          {/* Quick plate search bar */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por placa..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              className="w-full sm:w-60 pl-9 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono placeholder:font-sans focus:outline-none focus:border-cyan-400 uppercase"
            />
          </div>
        </section>

        {/* 3. TAB CONTENT: KANBAN BOARD */}
        {activeTab === "kanban" && (
          <div className="space-y-3.5">
            {/* Mobile Stage Selector Pills */}
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setMobileKanbanStage("todos")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  mobileKanbanStage === "todos"
                    ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Todas las Bahías ({filteredBookings.length})
              </button>
              {([1, 2, 3, 4, 5] as BookingStage[]).map((st) => {
                const count = filteredBookings.filter((b) => b.stage === st).length;
                const cfg = STAGE_CONFIG[st];
                return (
                  <button
                    key={st}
                    onClick={() => setMobileKanbanStage(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      mobileKanbanStage === st
                        ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{cfg.shortLabel}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        mobileKanbanStage === st
                          ? "bg-black/20 text-slate-950 font-black"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
              {([1, 2, 3, 4, 5] as BookingStage[]).map((colStage) => {
                const stageConfig = STAGE_CONFIG[colStage];
                const colBookings = filteredBookings.filter((b) => b.stage === colStage);
                const isHiddenOnMobile =
                  mobileKanbanStage !== "todos" && mobileKanbanStage !== colStage;

                return (
                  <div
                    key={colStage}
                    className={`rounded-2xl bg-slate-900/60 border border-white/10 p-3 flex-col gap-3 min-h-[160px] md:min-h-[500px] ${
                      isHiddenOnMobile ? "hidden md:flex" : "flex"
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: stageConfig.color }}
                        />
                        <h4 className="text-xs font-black text-white">{stageConfig.label}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-slate-400">
                        {colBookings.length}
                      </span>
                    </div>

                    {/* Booking Cards in this stage */}
                    <div className="space-y-3 flex-1">
                      {colBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 transition-all space-y-2.5 group shadow-lg"
                        >
                          {/* Top: License Plate & Vehicle Icon */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-xs font-black text-white tracking-wider border border-white/15 whitespace-nowrap shrink-0">
                                {b.licensePlate}
                              </span>
                              {b.isWalkIn && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                                  Sin cita
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-bold text-cyan-400">
                              {formatCurrency(b.price)}
                            </span>
                          </div>

                          {/* Service & Client Name */}
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-1">{b.serviceName}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{b.clientName}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-[10px] text-slate-500 shrink-0">{b.time}</span>
                            </p>
                          </div>

                          {/* Operario / Lavador Asignado */}
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px]">
                            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-slate-400 text-[10px] font-semibold shrink-0">Lavador:</span>
                            <select
                              value={b.assignedEmployee || ""}
                              onChange={(e) => handleAssignEmployee(b.id, e.target.value)}
                              className="bg-transparent text-cyan-200 font-bold focus:outline-none cursor-pointer w-full truncate text-[11px]"
                            >
                              <option value="" className="bg-slate-900 text-slate-400">Sin asignar</option>
                              {employeesList.map((emp) => (
                                <option key={emp} value={emp} className="bg-slate-900 text-white">
                                  {emp}
                                </option>
                              ))}
                              {b.assignedEmployee && !employeesList.includes(b.assignedEmployee) && (
                                <option value={b.assignedEmployee} className="bg-slate-900 text-white">
                                  {b.assignedEmployee}
                                </option>
                              )}
                            </select>
                          </div>

                          {/* Bay & Notes */}
                          <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                            <span className="truncate">{b.bay}</span>
                            {canViewFinancials ? (
                              <select
                                value={b.isPaid ? (b.paymentMethod || "efectivo") : "pendiente"}
                                onChange={(e) => {
                                  const val = e.target.value as AdminBooking["paymentMethod"];
                                  handleChangePaymentMethod(b.id, val);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border focus:outline-none cursor-pointer max-w-[105px] truncate ${
                                  b.isPaid
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                }`}
                                title="Seleccionar estado y método de pago"
                              >
                                <option value="pendiente" className="bg-slate-900 text-amber-300">⏳ Pendiente</option>
                                <option value="efectivo" className="bg-slate-900 text-emerald-300">💵 Efectivo</option>
                                <option value="nequi" className="bg-slate-900 text-purple-300">📱 Nequi</option>
                                <option value="daviplata" className="bg-slate-900 text-red-300">🏦 Daviplata</option>
                                <option value="tarjeta" className="bg-slate-900 text-cyan-300">💳 Tarjeta</option>
                              </select>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 text-slate-400">
                                {b.isPaid ? (b.paymentMethod?.toUpperCase() || "PAGADO") : "PENDIENTE"}
                              </span>
                            )}
                          </div>

                          {/* WhatsApp Notification Trigger when vehicle is READY (Stage 4) */}
                          {colStage === 4 && (
                            <a
                              href={createWhatsAppReadyLink(b)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                            >
                              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Avisar al Cliente por WhatsApp</span>
                            </a>
                          )}

                          {/* Action buttons (Advance stage, move, receipt, delete) */}
                          <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedReceiptBooking(b)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors flex items-center gap-1"
                                title="Generar e Imprimir Recibo"
                              >
                                <Receipt className="w-3 h-3 text-cyan-400" />
                                <span>Recibo</span>
                              </button>

                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {colStage < 5 ? (
                              <button
                                onClick={() => handleAdvanceStage(b.id, b.stage)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/5 hover:bg-cyan-500/20 text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition-all flex items-center gap-1"
                              >
                                <span>Avanzar</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                                <CheckCircle className="w-3 h-3" />
                                <span>Finalizado</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {colBookings.length === 0 && (
                        <div className="p-6 text-center text-xs text-slate-500 italic border border-dashed border-white/5 rounded-xl">
                          Sin vehículos en esta fase
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. TAB CONTENT: VEHICLE LIST (CARDS ON MOBILE, TABLE ON DESKTOP) */}
        {activeTab === "table" && (
          <div className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden shadow-2xl">
            {/* Filter Header */}
            <div className="p-3.5 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-slate-400 whitespace-nowrap">Estado:</span>
                <select
                  value={selectedFilterStage}
                  onChange={(e) => setSelectedFilterStage(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="1">1. En Espera / Recepción</option>
                  <option value="2">2. En Bahía de Lavado</option>
                  <option value="3">3. Detallado & Secado</option>
                  <option value="4">4. ¡Listo para Retiro!</option>
                  <option value="5">5. Entregado</option>
                </select>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-slate-400">
                  Mostrando{" "}
                  <strong className="text-white">
                    {filteredBookings.length === 0
                      ? 0
                      : `${tableStartIndex + 1}–${Math.min(
                          tableStartIndex + itemsPerPage,
                          filteredBookings.length
                        )}`}
                  </strong>{" "}
                  de <strong className="text-cyan-400">{filteredBookings.length}</strong> turnos
                  {bookings.length > filteredBookings.length && (
                    <span className="text-slate-500"> (de {bookings.length} totales en sistema)</span>
                  )}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-[11px] font-bold">Ver:</span>
                  {[25, 50, 100, 9999].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        setItemsPerPage(count);
                        setTableCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        itemsPerPage === count
                          ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                          : "bg-white/5 hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      {count === 9999 ? "Todos" : count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Cards View (Hidden on md and up) */}
            <div className="block md:hidden p-3 space-y-3">
              {paginatedBookings.map((b) => {
                const stage = (b.stage && STAGE_CONFIG[b.stage as BookingStage]) ? (b.stage as BookingStage) : 1;
                const stageConfig = STAGE_CONFIG[stage] || STAGE_CONFIG[1];

                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-white/10 font-mono text-sm font-black text-white tracking-wider border border-white/15">
                          {b.licensePlate}
                        </span>
                        {b.isWalkIn ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/20">
                            Presencial
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/20">
                            Web
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-black text-cyan-400">
                        {formatCurrency(b.price)}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white">{b.serviceName}</p>
                      <p className="text-slate-400 flex items-center justify-between">
                        <span>{b.clientName} ({b.vehicleType})</span>
                        <a
                          href={`https://wa.me/57${b.clientPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 font-bold hover:underline"
                        >
                          {b.clientPhone}
                        </a>
                      </p>
                    </div>

                    {/* Washer Selector on Mobile Card */}
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">Lavador:</span>
                      <select
                        value={b.assignedEmployee || ""}
                        onChange={(e) => handleAssignEmployee(b.id, e.target.value)}
                        className="bg-transparent text-cyan-200 text-xs font-bold focus:outline-none flex-1 truncate"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">Sin asignar</option>
                        {employeesList.map((emp) => (
                          <option key={emp} value={emp} className="bg-slate-900 text-white">{emp}</option>
                        ))}
                        {b.assignedEmployee && !employeesList.includes(b.assignedEmployee) && (
                          <option value={b.assignedEmployee} className="bg-slate-900 text-white">{b.assignedEmployee}</option>
                        )}
                      </select>
                    </div>

                    {/* Stage Selector on Mobile Card */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      <select
                        value={stage}
                        onChange={(e) =>
                          handleChangeStage(b.id, Number(e.target.value) as BookingStage)
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-none flex-1 truncate ${stageConfig.badgeClass}`}
                      >
                        <option value={1}>1. En Espera</option>
                        <option value={2}>2. En Lavado</option>
                        <option value={3}>3. Detallado/Secado</option>
                        <option value={4}>4. ¡Listo!</option>
                        <option value={5}>5. Entregado</option>
                      </select>

                      {canViewFinancials ? (
                        <select
                          value={b.isPaid ? (b.paymentMethod || "efectivo") : "pendiente"}
                          onChange={(e) => {
                            const val = e.target.value as AdminBooking["paymentMethod"];
                            handleChangePaymentMethod(b.id, val);
                          }}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold border focus:outline-none shrink-0 cursor-pointer ${
                            b.isPaid
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                          title="Método de pago"
                        >
                          <option value="pendiente" className="bg-slate-900 text-amber-300">⏳ Pendiente</option>
                          <option value="efectivo" className="bg-slate-900 text-emerald-300">💵 Efectivo</option>
                          <option value="nequi" className="bg-slate-900 text-purple-300">📱 Nequi</option>
                          <option value="daviplata" className="bg-slate-900 text-red-300">🏦 Daviplata</option>
                          <option value="tarjeta" className="bg-slate-900 text-cyan-300">💳 Tarjeta</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/5 text-slate-400">
                          {b.isPaid ? (b.paymentMethod?.toUpperCase() || "PAGADO") : "PENDIENTE"}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons on Mobile Card */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReceiptBooking(b)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 font-bold text-xs flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Recibo</span>
                        </button>

                        {b.stage === 4 && (
                          <a
                            href={createWhatsAppReadyLink(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold text-xs flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteBooking(b.id)}
                        className="p-1.5 rounded text-slate-600 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredBookings.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  No hay vehículos que coincidan con la búsqueda.
                </div>
              )}
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/50 border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Código / Placa</th>
                    <th className="py-3 px-4">Vehículo</th>
                    <th className="py-3 px-4">Servicio</th>
                    <th className="py-3 px-4">Cliente & Contacto</th>
                    <th className="py-3 px-4">Bahía</th>
                    <th className="py-3 px-4">Lavador / Operario</th>
                    <th className="py-3 px-4">Estado del Lavado</th>
                    <th className="py-3 px-4">{canViewFinancials ? "Monto & Método de Pago" : "Fecha & Pago"}</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedBookings.map((b) => {
                    const stage = (b.stage && STAGE_CONFIG[b.stage as BookingStage]) ? (b.stage as BookingStage) : 1;
                    const stageConfig = STAGE_CONFIG[stage] || STAGE_CONFIG[1];
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          <span className="px-2 py-1 rounded bg-white/10 border border-white/10">
                            {b.licensePlate}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-sans mt-1">
                            {b.code} {b.isWalkIn ? "(Sin cita)" : "(Web)"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 capitalize text-slate-300">
                          {b.vehicleType}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-white">
                          {b.serviceName}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{b.clientName}</p>
                          <p className="text-[11px] text-slate-400">{b.clientPhone}</p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          {b.bay || "Bahía 1 (Lavado)"}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <select
                              value={b.assignedEmployee || ""}
                              onChange={(e) => handleAssignEmployee(b.id, e.target.value)}
                              className="bg-black/50 text-cyan-200 text-xs font-semibold px-2 py-1 rounded-lg border border-white/15 focus:outline-none focus:border-cyan-400 cursor-pointer"
                            >
                              <option value="" className="bg-slate-900 text-slate-400">Sin asignar</option>
                              {employeesList.map((emp) => (
                                <option key={emp} value={emp} className="bg-slate-900 text-white">{emp}</option>
                              ))}
                              {b.assignedEmployee && !employeesList.includes(b.assignedEmployee) && (
                                <option value={b.assignedEmployee} className="bg-slate-900 text-white">{b.assignedEmployee}</option>
                              )}
                            </select>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={stage}
                            onChange={(e) =>
                              handleChangeStage(b.id, Number(e.target.value) as BookingStage)
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none ${stageConfig.badgeClass}`}
                          >
                            <option value={1}>1. En Espera</option>
                            <option value={2}>2. En Lavado</option>
                            <option value={3}>3. Detallado/Secado</option>
                            <option value={4}>4. ¡Listo para Retiro!</option>
                            <option value={5}>5. Entregado</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4">
                          {canViewFinancials ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-white">{formatCurrency(b.price)}</p>
                                {b.discountPercent && b.discountPercent > 0 ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase">
                                    -{b.discountPercent}% OFF
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-1">
                                <select
                                  value={b.isPaid ? (b.paymentMethod || "efectivo") : "pendiente"}
                                  onChange={(e) => {
                                    const val = e.target.value as AdminBooking["paymentMethod"];
                                    handleChangePaymentMethod(b.id, val);
                                  }}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border focus:outline-none cursor-pointer ${
                                    b.isPaid
                                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                      : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                  }`}
                                  title="Seleccionar método de pago"
                                >
                                  <option value="pendiente" className="bg-slate-900 text-amber-300">⏳ Pendiente</option>
                                  <option value="efectivo" className="bg-slate-900 text-emerald-300">💵 Efectivo</option>
                                  <option value="nequi" className="bg-slate-900 text-purple-300">📱 Nequi</option>
                                  <option value="daviplata" className="bg-slate-900 text-red-300">🏦 Daviplata</option>
                                  <option value="tarjeta" className="bg-slate-900 text-cyan-300">💳 Tarjeta / Dataf.</option>
                                </select>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-cyan-300">{b.day || "Hoy"}</p>
                              <p className="text-[11px] text-slate-400">{b.time}</p>
                              <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                b.isPaid ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                              }`}>
                                {b.isPaid ? (b.paymentMethod?.toUpperCase() || "PAGADO") : "PENDIENTE"}
                              </span>
                            </>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          {b.stage === 4 && (
                            <a
                              href={createWhatsAppReadyLink(b)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black font-bold text-[10px] transition-colors"
                              title="Avisar por WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>Avisar</span>
                            </a>
                          )}

                          <button
                            onClick={() => setSelectedReceiptBooking(b)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 font-bold text-[10px] transition-colors"
                            title="Generar e Imprimir Recibo"
                          >
                            <Receipt className="w-3 h-3 text-cyan-400" />
                            <span>Recibo</span>
                          </button>

                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 10-BY-10 PAGINATION FOOTER */}
            {filteredBookings.length > 0 && (
              <div className="p-3.5 sm:p-4 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Página <strong className="text-white font-mono">{safeTablePage}</strong> de{" "}
                  <strong className="text-cyan-400 font-mono">{totalTablePages}</strong> •{" "}
                  Mostrando {tableStartIndex + 1} a{" "}
                  {Math.min(tableStartIndex + itemsPerPage, filteredBookings.length)} de{" "}
                  {filteredBookings.length} vehículos
                </span>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={safeTablePage <= 1}
                    onClick={() => setTableCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Anterior</span>
                  </button>

                  {Array.from({ length: totalTablePages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setTableCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        safeTablePage === pageNum
                          ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25"
                          : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safeTablePage >= totalTablePages}
                    onClick={() =>
                      setTableCurrentPage((prev) => Math.min(totalTablePages, prev + 1))
                    }
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. TAB CONTENT: CASH & ACCOUNTING */}
        {activeTab === "caja" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Cash Summary by Payment Method */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Desglose de Ingresos por Método de Pago</span>
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-semibold text-slate-300">Efectivo en Caja</span>
                    <span className="text-sm font-black text-white">
                      {formatCurrency(paymentBreakdown.efectivo)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-semibold text-slate-300">Transferencias Nequi</span>
                    <span className="text-sm font-black text-white">
                      {formatCurrency(paymentBreakdown.nequi)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-semibold text-slate-300">Transferencias Daviplata</span>
                    <span className="text-sm font-black text-white">
                      {formatCurrency(paymentBreakdown.daviplata)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-semibold text-slate-300">Datafono / Tarjeta</span>
                    <span className="text-sm font-black text-white">
                      {formatCurrency(paymentBreakdown.tarjeta)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-400">
                    Total Cobrado (
                    {dateFilterPreset === "todos"
                      ? "Historial Acumulado"
                      : dateFilterPreset === "hoy"
                      ? "Hoy"
                      : dateFilterPreset === "ayer"
                      ? "Ayer"
                      : dateFilterPreset === "semana"
                      ? "Esta Semana"
                      : dateFilterPreset === "mes"
                      ? "Este Mes"
                      : selectedCustomDate}
                    )
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {formatCurrency(totalPaidRevenue)}
                  </span>
                </div>
              </div>

              {/* Petty Cash Expenses List */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-rose-400" />
                    <span>Salidas y Gastos de Caja Menor</span>
                  </h3>
                  <button
                    onClick={() => setIsExpenseOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-black transition-colors"
                  >
                    + Registrar Gasto
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {filteredExpenses.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs hover:border-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-white">{e.description}</p>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {e.category} • {e.date} • {e.time}
                        </p>
                      </div>
                      <span className="font-black text-rose-400">
                        -{formatCurrency(e.amount)}
                      </span>
                    </div>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-4">
                      No hay gastos registrados para este período / fecha seleccionada.
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-400">Total Gastos</span>
                  <span className="text-lg font-black text-rose-400">
                    -{formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB CONTENT: SCHEDULE & CAPACITY MANAGER */}
        {activeTab === "agenda" && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>Gestión de Horarios y Cupos en Línea</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Administra la disponibilidad de turnos para cualquier día de la semana. Bloquea o libera cupos en tiempo real.
                </p>
              </div>

              {/* Direct date picker for agenda */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Fecha a Gestionar:</span>
                <input
                  type="date"
                  value={agendaDate}
                  min={todayIso}
                  onChange={(e) => setAgendaDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Quick Day Selector for Upcoming Days */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {agendaUpcomingDays.map((dayItem) => {
                const isSelected = agendaDate === dayItem.isoStr;

                return (
                  <button
                    key={dayItem.isoStr}
                    type="button"
                    onClick={() => setAgendaDate(dayItem.isoStr)}
                    className={`min-w-[72px] py-2.5 px-2 rounded-xl border text-center transition-all shrink-0 flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400"
                        : "bg-white/[0.03] border-white/10 text-slate-300 hover:border-slate-600 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold">
                      {dayItem.dayLabel}
                    </span>
                    <span className="text-base font-black">{dayItem.dateNum}</span>
                    <span className="text-[9px] opacity-80">{dayItem.monthName}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Control Panel: Manual Time Adder, Interval Presets & Simultaneous Capacity */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/25 space-y-4">
              {scheduleNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{scheduleNotice}</span>
                </div>
              )}

              {/* Scope Switch: Apply to all days vs only selected date */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    Configuración Manual y Rápida de Turnos
                  </span>
                </div>

                <div className="inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setApplyScheduleAllDays(true)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      applyScheduleAllDays
                        ? "bg-cyan-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Aplicar a Todos los Días
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyScheduleAllDays(false)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      !applyScheduleAllDays
                        ? "bg-cyan-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Solo para {agendaDate}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                {/* 1. Agregar Horario Manual */}
                <form onSubmit={handleAddManualSlot} className="lg:col-span-4 space-y-1.5">
                  <label className="text-[11px] uppercase font-bold text-slate-300 block">
                    1. Agregar Hora Manual (Ej: 08:20, 09:45)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={newManualTime}
                      onChange={(e) => setNewManualTime(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl text-xs font-black uppercase bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+ Agregar</span>
                    </button>
                  </div>
                </form>

                {/* 2. Generador Rápido por Intervalo (20, 30, 45, 60 min) */}
                <div className="lg:col-span-5 space-y-1.5">
                  <label className="text-[11px] uppercase font-bold text-slate-300 block">
                    2. Armar Parrilla Automática según Duración
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([20, 30, 45, 60] as const).map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleApplyIntervalPreset(mins)}
                        className="py-2 px-2 rounded-xl text-[11px] font-bold bg-white/5 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer"
                      >
                        Cada {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Capacidad Simultánea por Turno (1, 2 o 3 bahías) */}
                <div className="lg:col-span-3 space-y-1.5">
                  <label className="text-[11px] uppercase font-bold text-slate-300 block">
                    3. Cupos por Hora (Bahías)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => handleChangeSlotCapacity(cap)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-black border transition-all cursor-pointer ${
                          slotCapacity === cap
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {cap} {cap === 1 ? "Auto" : "Autos"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Emergency Day Actions */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400">
                  Acciones rápidas para el día <strong className="text-white font-mono">{agendaDate}</strong>:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBlockOrUnblockAllDay(false)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Liberar Todo el Día</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBlockOrUnblockAllDay(true)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pausar / Bloquear Todo el Día</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Capacity Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Horarios del Día</span>
                <span className="text-base font-black text-white">
                  {agendaSlots.length} horas ({agendaSlots.length * slotCapacity} cupos)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Horarios Disponibles</span>
                <span className="text-base font-black text-emerald-400">
                  {agendaSlots.filter((s) => {
                    const isBlocked = blockedSlots.includes(`${agendaDate}_${s.time}`) || blockedSlots.includes(s.time);
                    const bookedCount = bookings.filter(
                      (b) => (b.appointmentDate === agendaDate || (agendaDate === todayIso && b.day?.toLowerCase().includes("hoy"))) && b.time === s.time && b.stage < 5
                    ).length;
                    return !isBlocked && bookedCount < slotCapacity;
                  }).length} libres
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Vehículos Reservados</span>
                <span className="text-base font-black text-cyan-400">
                  {bookings.filter(
                    (b) => (b.appointmentDate === agendaDate || (agendaDate === todayIso && b.day?.toLowerCase().includes("hoy"))) && b.stage < 5
                  ).length} citas
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Horarios Bloqueados</span>
                <span className="text-base font-black text-rose-400">
                  {agendaSlots.filter((s) => blockedSlots.includes(`${agendaDate}_${s.time}`) || blockedSlots.includes(s.time)).length} bloqueados
                </span>
              </div>
            </div>

            {/* Slots Grid with Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              {agendaSlots.map((slotItem) => {
                const isBlocked = blockedSlots.includes(`${agendaDate}_${slotItem.time}`) || blockedSlots.includes(slotItem.time);
                const bookedVehicles = bookings.filter(
                  (b) => (b.appointmentDate === agendaDate || (agendaDate === todayIso && b.day?.toLowerCase().includes("hoy"))) && b.time === slotItem.time && b.stage < 5
                );
                const isFull = bookedVehicles.length >= slotCapacity;

                return (
                  <div
                    key={slotItem.time}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                      isFull
                        ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-200"
                        : isBlocked
                        ? "bg-red-950/20 border-red-500/30 text-red-300"
                        : bookedVehicles.length > 0
                        ? "bg-blue-950/25 border-blue-500/35 text-blue-200"
                        : "bg-emerald-950/15 border-emerald-500/25 text-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-mono font-bold text-white">{slotItem.time}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                            isFull
                              ? "bg-cyan-500/20 text-cyan-300"
                              : isBlocked
                              ? "bg-red-500/20 text-red-400"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {isBlocked
                            ? "Bloqueado"
                            : isFull
                            ? "Lleno"
                            : slotCapacity > 1
                            ? `${bookedVehicles.length}/${slotCapacity} Ocup.`
                            : "Libre"}
                        </span>

                        {bookedVehicles.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slotItem.time)}
                            className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Eliminar este horario de la parrilla"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {bookedVehicles.length > 0 ? (
                      <div className="space-y-1.5">
                        {bookedVehicles.map((bv) => (
                          <div
                            key={bv.id}
                            className="text-[11px] space-y-0.5 bg-black/40 p-2 rounded-lg border border-cyan-500/20"
                          >
                            <p className="font-bold text-white font-mono">{bv.licensePlate}</p>
                            <p className="text-slate-300 truncate">{bv.clientName}</p>
                            <p className="text-[10px] text-cyan-400 truncate">{bv.serviceName}</p>
                          </div>
                        ))}
                      </div>
                    ) : isBlocked ? (
                      <p className="text-[11px] text-red-400 italic py-1">
                        Turno bloqueado para clientes web
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-400/80 py-1">
                        {slotCapacity > 1
                          ? `${slotCapacity} cupos disponibles`
                          : "Cupo disponible para agendar"}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleSlot(slotItem.time, agendaDate)}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isBlocked
                          ? "bg-white/10 hover:bg-emerald-500 hover:text-black text-slate-300"
                          : "bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-slate-400"
                      }`}
                    >
                      {isBlocked ? "Desbloquear Horario" : "Bloquear Horario"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. TAB CONTENT: PREMIUM PRODUCTS & PRICING MANAGER (SUPER ADMIN ONLY) */}
        {activeTab === "productos" && canViewFinancials && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Exclusivo Super Admin • Autogestionable sin Código</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-cyan-400" />
                  <span>Catálogo de Productos Premium & Precios</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Crea nuevos productos, cambia precios o sube las fotografías reales desde tu computador o celular cuando te lleguen. Todos los cambios se actualizan al instante en la pantalla principal y en la vitrina del spa.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetProducts}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
                >
                  Restaurar Base
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Crear / Subir Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Products Admin Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => {
                const isCustomImg =
                  prod.image.startsWith("data:") || prod.image.startsWith("http");

                return (
                  <div
                    key={prod.id}
                    className="rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                  >
                    <div>
                      <div className="relative w-full h-48 bg-slate-900 border-b border-white/10 overflow-hidden">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          unoptimized={isCustomImg}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="360px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-black/80 border border-cyan-400/30 text-[10px] font-bold text-cyan-300 uppercase">
                            {prod.categoryLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-black/80 border border-white/15 text-[10px] font-mono text-emerald-400">
                            {prod.phLevel}
                          </span>
                        </div>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-slate-300 bg-black/70 px-2 py-0.5 rounded border border-white/10">
                            {prod.presentation}
                          </span>
                          <span className="text-base font-black text-white bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 rounded-lg backdrop-blur-md">
                            {formatCurrency(prod.price)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {prod.summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar / Cambiar Foto o Precio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/25 transition-all cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE / EDIT PREMIUM PRODUCT */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        editingProduct={editingProduct}
        onSaved={(updatedList) => setProducts(updatedList)}
      />

      {/* MODAL: EXPRESS WALK-IN REGISTRATION */}
      <ExpressWalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onBookingCreated={(newB) => {
          setBookings((prev) => [
            newB,
            ...prev.filter((b) => b.id !== newB.id && b.code !== newB.code),
          ]);
          setIsWalkInOpen(false);
          refreshData();
        }}
        canViewFinancials={canViewFinancials}
        employees={employeesList}
      />

      {/* MODAL: GESTIÓN DE LAVADORES / PERSONAL */}
      {canViewFinancials && (
        <ManageEmployeesModal
          isOpen={isEmployeesModalOpen}
          onClose={() => setIsEmployeesModalOpen(false)}
          employees={employeesList}
          onEmployeesUpdated={(newList) => setEmployeesList(newList)}
        />
      )}

      {/* MODAL: ADD EXPENSE */}
      <AddExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => setIsExpenseOpen(false)}
        onExpenseAdded={() => refreshData()}
      />

      {/* MODAL: CUSTOMER RECEIPT (IMPRIMIR / PDF / WHATSAPP) */}
      <CustomerReceiptModal
        isOpen={!!selectedReceiptBooking}
        onClose={() => setSelectedReceiptBooking(null)}
        booking={selectedReceiptBooking}
        onUpdateBooking={handleUpdateBookingFromReceipt}
        canViewFinancials={canViewFinancials}
      />

      {/* MODAL: CHANGE ADMIN CREDENTIALS */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUsername={currentAdmin?.username || "admin"}
      />
    </div>
  );
}
