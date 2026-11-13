"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import confetti from "canvas-confetti";
import { BUSINESS_CONFIG } from "@/data/servicesData";

interface GrandOpeningModalProps {
  onScrollToBooking: () => void;
}

export default function GrandOpeningModal({ onScrollToBooking }: GrandOpeningModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem("exclusive_grand_opening_v6_seen");
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          try {
            confetti({
              particleCount: 70,
              spread: 70,
              origin: { y: 0.55 },
              colors: ["#00f0ff", "#3b82f6", "#ffffff", "#f59e0b", "#10b981"],
              ticks: 200,
            });
          } catch (e) {}
        }, 150);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Fallback if sessionStorage is blocked
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem("exclusive_grand_opening_v6_seen", "true");
    } catch (e) {}
  };

  const handleBookNow = () => {
    handleClose();
    onScrollToBooking();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[460px] rounded-3xl bg-[#090d16] border border-cyan-500/30 p-3 sm:p-4 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 min-w-[38px] min-h-[38px] p-2 rounded-full bg-black/75 hover:bg-black text-white border border-white/25 shadow-lg transition-all flex items-center justify-center touch-manipulation cursor-pointer active:scale-95"
          aria-label="Cerrar ventana de inauguración"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Flyer Image Container */}
        <div className="relative w-full overflow-y-auto rounded-2xl border border-white/10 bg-black">
          <img
            src="/images/flyer-inauguracion.jpg"
            alt="Gran Inauguración 21 de Noviembre - Exclusive Detallado de Vehículos"
            className="w-full h-auto max-h-[72vh] object-contain mx-auto block rounded-2xl cursor-pointer"
            onClick={handleBookNow}
          />
        </div>

        {/* Action Buttons Below Image */}
        <div className="w-full mt-3 grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleBookNow}
            className="w-full h-11 px-3.5 rounded-xl text-xs font-black uppercase tracking-wide whitespace-nowrap bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all inline-flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Agendar mi Visita</span>
          </button>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
              "¡Hola Exclusive Detallado de Vehículos! Vi el volante de inauguración del 21 de Noviembre con el 15% OFF y quiero agendar mi lavada en Calle 28 #74A-10 Belén Granadas."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="w-full h-11 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap text-white bg-white/[0.08] hover:bg-white/[0.15] active:bg-white/20 border border-white/15 inline-flex items-center justify-center gap-2 transition-all touch-manipulation cursor-pointer"
          >
            <svg
              className="w-4 h-4 shrink-0 drop-shadow-sm"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fill="#25D366"
                d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2Z"
              />
              <path
                fill="#FFFFFF"
                d="M17.47 14.38C17.18 14.23 15.72 13.51 15.45 13.41C15.18 13.31 14.98 13.26 14.78 13.56C14.58 13.86 14.01 14.53 13.84 14.73C13.67 14.93 13.49 14.95 13.2 14.8C12.9 14.65 11.94 14.34 10.81 13.33C9.93 12.54 9.33 11.57 9.16 11.27C8.98 10.97 9.14 10.81 9.29 10.66C9.42 10.53 9.58 10.31 9.73 10.14C9.88 9.97 9.93 9.84 10.03 9.64C10.13 9.44 10.08 9.27 10.01 9.12C9.93 8.97 9.26 7.36 8.99 6.76C8.75 6.18 8.5 6.26 8.32 6.25C8.15 6.24 7.95 6.24 7.75 6.24C7.55 6.24 7.23 6.31 6.96 6.61C6.69 6.91 5.92 7.63 5.92 9.09C5.92 10.55 6.99 11.96 7.13 12.16C7.28 12.36 9.23 15.37 12.21 16.66C12.92 16.97 13.47 17.15 13.9 17.29C14.61 17.52 15.26 17.48 15.77 17.41C16.34 17.32 17.53 16.69 17.78 15.99C18.03 15.3 18.03 14.7 17.95 14.58C17.88 14.45 17.68 14.38 17.47 14.38Z"
              />
            </svg>
            <span>Escribir por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
