"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Radio, Clock, ShieldCheck, Droplets, CheckCircle, Car, Truck, Bike } from "lucide-react";

export default function LiveStudioStatusStrip() {
  const [activeBays, setActiveBays] = useState([
    {
      bay: "Bahía #1 (Lavado Principal)",
      status: "ocupada",
      vehicle: "Mazda CX-30",
      type: "Camioneta",
      step: "Espuma Snow Foam pH Neutro",
      timeLeft: "12 min restantes",
    },
    {
      bay: "Bahía #2 (Secado & Detallado)",
      status: "disponible",
      vehicle: "Disponible para tu cita",
      type: "Automóvil",
      step: "Próximo turno en cola",
      timeLeft: "Turno inmediato",
    },
    {
      bay: "Bahía #3 (Zona Motocicletas)",
      status: "ocupada",
      vehicle: "Yamaha MT-09",
      type: "Moto",
      step: "Desengrase técnico de cadena & motor",
      timeLeft: "8 min restantes",
    },
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 my-8">
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-72 h-16 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <span className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                Estado Operativo de Bahías en Vivo
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  TIEMPO REAL
                </span>
              </span>
              <p className="text-[11px] text-slate-400">
                Capacidad actual: <strong className="text-white">2 de 3</strong> bahías en servicio • Espera promedio: <strong className="text-cyan-400">10-15 min</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Agua Suavizada 0 PPM</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garantía de Acabado</span>
            </span>
          </div>
        </div>

        {/* Bays Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
          {activeBays.map((bay, idx) => {
            const isBusy = bay.status === "ocupada";
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isBusy
                    ? "bg-black/40 border-cyan-500/20"
                    : "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    {bay.type === "Moto" ? (
                      <Bike className="w-3.5 h-3.5 text-cyan-400" />
                    ) : bay.type === "Camioneta" ? (
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Car className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{bay.bay}</span>
                  </span>

                  <span
                    className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isBusy
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isBusy ? "bg-cyan-400" : "bg-emerald-400"
                      }`}
                    />
                    {isBusy ? "En Tratamiento" : "Libre / Reserva"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-white">{bay.vehicle}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {bay.step}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{bay.timeLeft}</span>
                  </span>
                  {!isBusy && (
                    <a
                      href="#agendar"
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      Tomar Turno &rarr;
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
