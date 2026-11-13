"use client";

import React, { useState } from "react";
import { ExpenseItem, saveExpense } from "@/data/adminStore";
import { formatCurrency } from "@/data/servicesData";
import { X, Receipt, DollarSign, AlertCircle, ShoppingBag } from "lucide-react";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: (expense: ExpenseItem) => void;
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<ExpenseItem["category"]>("insumos");
  const [expenseDate, setExpenseDate] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setExpenseDate(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = parseInt(amount.replace(/\D/g, ""), 10);
    if (!description.trim()) {
      setError("Por favor ingresa una descripción para el gasto.");
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Por favor ingresa un monto válido mayor a $0.");
      return;
    }

    const created = saveExpense({
      description: description.trim(),
      category,
      amount: numAmount,
      date: expenseDate || new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
    });

    onExpenseAdded(created);
    onClose();

    // Reset
    setDescription("");
    setAmount("");
    setNotes("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0c1019] border border-white/10 p-6 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Registrar Gasto de Caja</h3>
              <p className="text-xs text-slate-400">Salida de dinero de caja menor</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
              Descripción del Gasto *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ej: Compra de 2 galones de champú pH neutro"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-red-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                Valor ($ COP) *
              </label>
              <input
                type="number"
                required
                placeholder="45000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm font-bold focus:outline-none focus:border-red-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-red-400"
              >
                <option value="insumos">Insumos de Lavado</option>
                <option value="nomina">Alimentos / Personal</option>
                <option value="mantenimiento">Repuestos / Mantenimiento</option>
                <option value="servicios">Servicios Públicos</option>
                <option value="otro">Otro Gasto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
              Fecha del Gasto
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-red-400"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-300 block mb-1">
              Notas Adicionales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Factura #4012 o entregado a Luis"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-red-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-400 text-slate-950 transition-all shadow-md shadow-red-500/20"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
