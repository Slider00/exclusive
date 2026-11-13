"use client";

import React, { useState, useEffect } from "react";

export default function ExclusiveSplashPreloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for a brief luxury intro (~850ms), then smoothly fade out
    const timerFade = setTimeout(() => {
      setFading(true);
    }, 850);

    const timerRemove = setTimeout(() => {
      setVisible(false);
    }, 1350);

    return () => {
      clearTimeout(timerFade);
      clearTimeout(timerRemove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07090E] select-none transition-all duration-500 ease-out ${
        fading ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Ambient background glow */}
      <div className="absolute w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-pulse" />

      {/* Brand Emblem */}
      <div className="relative z-10 flex flex-col items-center px-4">
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/25 via-blue-500/30 to-cyan-500/25 blur-xl rounded-full animate-pulse" />
          <img
            src="/images/logo.png?v=4"
            alt="EXCLUSIVE Spa Vehículos"
            className="relative h-14 sm:h-16 w-auto object-contain filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/* High-End Automotive Loading Bar */}
        <div className="w-48 sm:w-60 h-1 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
          <div className="splash-bar absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 rounded-full w-2/3" />
        </div>

        {/* Loading Tagline */}
        <p className="mt-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400/90 text-center">
          Exclusive Detallado & Spa
        </p>
      </div>

      <style jsx>{`
        .splash-bar {
          animation: splashSlide 1.2s ease-in-out infinite;
        }
        @keyframes splashSlide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
