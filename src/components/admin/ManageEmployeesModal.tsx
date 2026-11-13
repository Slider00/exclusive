"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  addEmployeeBackend,
  removeEmployeeBackend,
  DEFAULT_EMPLOYEES,
  saveStoredEmployees,
} from "@/data/adminStore";

interface ManageEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: string[];
  onEmployeesUpdated: (newList: string[]) => void;
}

export default function ManageEmployeesModal({
  isOpen,
  onClose,
  employees,
  onEmployeesUpdated,
}: ManageEmployeesModalProps) {
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg);
      setSuccessMsg(null);
    } else {
      setSuccessMsg(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccessMsg(null);
    }, 3500);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newName.trim();
    if (!clean) {
      showFeedback("Escribe el nombre del lavador", true);
      return;
    }
    if (employees.some((e) => e.toLowerCase() === clean.toLowerCase())) {
      showFeedback("Este lavador ya se encuentra registrado", true);
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await addEmployeeBackend(clean);
      onEmployeesUpdated(updated);
      setNewName("");
      showFeedback(`Lavador "${clean}" agregado exitosamente`);
    } catch {
      showFeedback("Error al guardar el lavador", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (employees.length <= 1) {
      showFeedback("Debe existir al menos un lavador en el sistema", true);
      return;
    }

    setDeletingName(name);
    try {
      const updated = await removeEmployeeBackend(name);
      onEmployeesUpdated(updated);
      showFeedback(`"${name}" fue eliminado del listado activo`);
    } catch {
      showFeedback("Error al retirar el lavador", true);
    } finally {
      setDeletingName(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("¿Deseas restablecer la lista de lavadores al equipo predeterminado?")) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employees: DEFAULT_EMPLOYEES }),
      });
      const data = await res.json();
      const list = data?.success && Array.isArray(data.employees) ? data.employees : DEFAULT_EMPLOYEES;
      saveStoredEmployees(list);
      onEmployeesUpdated(list);
      showFeedback("Equipo de lavadores restablecido a los valores de fábrica");
    } catch {
      saveStoredEmployees(DEFAULT_EMPLOYEES);
      onEmployeesUpdated(DEFAULT_EMPLOYEES);
      showFeedback("Equipo restablecido localmente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0c1019] border border-white/10 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-wide">
                  Gestión de Lavadores
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3" /> Solo Finanzas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Agrega o retira operarios sin modificar código
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Add Employee Form */}
        <form onSubmit={handleAdd} className="mt-4 relative z-10">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nuevo Lavador / Operario
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej: Daniel Restrepo"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newName.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Agregar</span>
            </button>
          </div>
        </form>

        {/* Employees List */}
        <div className="mt-5 flex-1 min-h-0 flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Equipo Activo ({employees.length})
            </span>
            <span className="text-[11px] text-slate-500">
              Disponible en todas las bahías y agendamiento
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {employees.map((emp, index) => {
              const isDeleting = deletingName === emp;
              return (
                <div
                  key={emp}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{emp}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Operario activo
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(emp)}
                    disabled={isDeleting || employees.length <= 1}
                    title={
                      employees.length <= 1
                        ? "Debe haber al menos un lavador"
                        : `Eliminar a ${emp}`
                    }
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSubmitting}
            className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer predeterminados</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
