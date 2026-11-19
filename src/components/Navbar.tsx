"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Calendar, Search, MessageCircle, Menu, X, ShieldCheck, Lock } from "lucide-react";
import HeaderFoamDrips from "@/components/HeaderFoamDrips";
import { getProductsSectionEnabled } from "@/data/adminStore";

interface NavbarProps {
  onOpenTracker: () => void;
  onScrollToBooking: () => void;
}

export default function Navbar({ onOpenTracker, onScrollToBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProductsNav, setShowProductsNav] = useState(true);

  useEffect(() => {
    setShowProductsNav(getProductsSectionEnabled());
    const handleVisibilityChange = () => setShowProductsNav(getProductsSectionEnabled());
    window.addEventListener("exclusive_products_visibility_changed", handleVisibilityChange);
    window.addEventListener("storage", handleVisibilityChange);
    return () => {
      window.removeEventListener("exclusive_products_visibility_changed", handleVisibilityChange);
      window.removeEventListener("storage", handleVisibilityChange);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 lg:px-6 py-3 md:py-3.5">
      <div className="max-w-[1720px] w-full mx-auto relative">
        <div className="glass-panel rounded-2xl px-3.5 sm:px-5 xl:px-6 py-2 md:py-2.5 flex items-center justify-between gap-2 xl:gap-4 border border-white/12 shadow-2xl backdrop-blur-2xl bg-[#080b11]/92 transition-all relative z-30 overflow-hidden">
          {/* Brand Logo with High-End Automotive Emblem Treatment */}
          <a
            href="#"
            className="relative flex items-center group shrink-0 py-0.5"
            title="Exclusive Detallado de Vehículos"
          >
            {/* Subtle luxury ambient silver/cyan back-glow behind the metallic emblem */}
            <div className="absolute inset-0 -inset-x-3 bg-[radial-gradient(ellipse_at_center,rgba(180,210,235,0.22)_0%,transparent_75%)] opacity-70 group-hover:opacity-100 transition-opacity blur-md pointer-events-none" />
            <img
              src="/images/logo.png?v=4"
              alt="Exclusive Detallado de Vehículos - Spa de Motos y Autos"
              className="relative z-10 h-10 sm:h-11 xl:h-13 w-auto object-contain filter drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-all duration-300"
            />
          </a>

          {/* Desktop Navigation Links (Balanced & Overflow-Proof at 100% Zoom) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-2 text-[11px] xl:text-xs 2xl:text-sm font-medium text-slate-300 bg-white/[0.03] p-1 xl:p-1.5 rounded-full border border-white/5 min-w-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
              title="Ingresa tu placa para consultar el avance técnico y estado de tu vehículo"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Rastrear Vehículo</span>
            </button>
            <a
              href="#servicios"
              className="px-2.5 xl:px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-cyan-300 transition-all whitespace-nowrap shrink-0"
            >
              Servicios & Precios
            </a>
            <a
              href="#transformacion"
              className="px-2.5 xl:px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-cyan-300 transition-all whitespace-nowrap shrink-0"
            >
              Antes & Después
            </a>
            <a
              href="#proceso"
              className="px-2.5 xl:px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-cyan-300 transition-all whitespace-nowrap shrink-0"
            >
              Proceso Técnico
            </a>
            {showProductsNav && (
              <a
                href="#productos"
                className="px-2.5 xl:px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-cyan-300 transition-all whitespace-nowrap shrink-0"
              >
                Productos Premium
              </a>
            )}
            <a
              href="#instalaciones"
              className="px-2.5 xl:px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-cyan-300 transition-all whitespace-nowrap shrink-0"
            >
              Instalaciones VIP
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2 xl:gap-2.5 shrink-0">
            <button
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 px-3 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold bg-white/[0.04] hover:bg-white/[0.1] text-slate-200 border border-white/10 hover:border-cyan-500/40 transition-all shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Consultar Placa</span>
            </button>

            <button
              onClick={onScrollToBooking}
              className="flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-xl text-xs xl:text-sm font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Agendar Cita</span>
            </button>

            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-400 hover:text-cyan-400 border border-white/10 transition-colors shrink-0"
              title="Panel Administrativo (Dueño)"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger & Quick Search */}
          <div className="flex lg:hidden items-center gap-2 relative z-40">
            <button
              type="button"
              onClick={onOpenTracker}
              className="min-w-[42px] min-h-[42px] p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-cyan-500/20 border border-white/10 text-cyan-400 flex items-center justify-center touch-manipulation cursor-pointer transition-all active:scale-95"
              title="Buscar por placa"
              aria-label="Buscar estado de vehículo por placa"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-cyan-500/20 border border-white/10 text-white flex items-center justify-center touch-manipulation cursor-pointer transition-all active:scale-95"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Organic Snow Foam Drips adhering along the bottom of the navbar (purely visual, pointer-events-none) */}
        <HeaderFoamDrips />

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl p-4 border border-white/15 bg-[#080b11]/98 backdrop-blur-2xl flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2 relative z-50">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTracker();
              }}
              className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/[0.06] active:bg-cyan-500/10 transition-colors touch-manipulation text-left cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Rastrear Vehículo (Consultar Placa)</span>
            </button>
            <a
              href="#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-white/[0.06] active:bg-cyan-500/10 transition-colors touch-manipulation"
            >
              Servicios & Precios
            </a>
            <a
              href="#transformacion"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-white/[0.06] active:bg-cyan-500/10 transition-colors touch-manipulation"
            >
              Antes & Después
            </a>
            <a
              href="#proceso"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-white/[0.06] active:bg-cyan-500/10 transition-colors touch-manipulation"
            >
              Proceso Técnico
            </a>
            {showProductsNav && (
              <a
                href="#productos"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-3 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-white/[0.06] active:bg-cyan-500/10 transition-colors touch-manipulation"
              >
                Productos Premium
              </a>
            )}
            <a
              href="#instalaciones"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-white/[0.06] active:bg-cyan-500/10 transition-colors touch-manipulation"
            >
              Instalaciones VIP
            </a>
            <a
              href="#agendar"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-3 rounded-xl text-sm font-medium text-slate-200 hover:text-cyan-400 hover:bg-white/[0.06] active:bg-cyan-500/10 transition-colors touch-manipulation"
            >
              Horarios & Agendamiento
            </a>

            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onScrollToBooking();
                }}
                className="w-full py-3.5 rounded-xl text-center text-sm font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 active:scale-98 transition-all touch-manipulation cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Cita en 30s</span>
              </button>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-xs text-slate-400 hover:text-cyan-400 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-2 touch-manipulation"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Panel Administrativo (Dueño)</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
