"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Sparkles, ArrowLeftRight, Droplets, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function BeforeAfterTransformation({
  onScrollToBooking,
}: {
  onScrollToBooking?: () => void;
}) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto w-full relative">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transformación Real de Estudio</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          La Diferencia de un <span className="text-gradient-cyan">Lavado Técnico</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
          Arrastra el deslizador hacia los lados para comparar la pintura con lluvia y barro vs el acabado hidrofóbico con sellado cerámico de nuestro estudio.
        </p>
      </div>

      {/* INTERACTIVE COMPARISON VIEWER */}
      <div className="max-w-4xl mx-auto">
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-[16/9] sm:aspect-[21/10] rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl select-none cursor-ew-resize group bg-slate-950"
        >
          {/* Base Image: Full Before/After image */}
          <div className="relative w-full h-full">
            <Image
              src="/images/before_after_split.jpg"
              alt="Comparativa Antes y Después Detailing"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 896px"
              className="object-cover"
              loading="lazy"
            />
          </div>

          {/* Left Badge: ANTES */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-black/85 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
              ❌ Antes: Polvo, Lluvia & Barro
            </span>
          </div>

          {/* Right Badge: DESPUÉS */}
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-cyan-500/90 text-slate-950 border border-cyan-300 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg">
              ✨ Después: Espejo & Perlas de Agua
            </span>
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-30 w-1 bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.8)] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Drag Handle Button */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-slate-950 border-2 border-cyan-400 text-cyan-400 flex items-center justify-center shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>

          {/* Bottom Floating Value Chips */}
          <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 text-[11px] font-medium text-slate-300 backdrop-blur-md hidden sm:flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Efecto hidrofóbico que repele agua y suciedad por semanas</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-black/80 border border-white/10 text-[11px] font-medium text-slate-300 backdrop-blur-md flex items-center gap-1.5 ml-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% libre de remolinos (swirls)</span>
            </div>
          </div>
        </div>

        {/* Action Button Below Slider */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="text-xs text-slate-400">
            ¿Tu auto necesita este nivel de brillo y protección?
          </p>
          <button
            onClick={onScrollToBooking}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            Agendar este Tratamiento &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
