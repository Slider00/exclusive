"use client";

import React from "react";
import Image from "next/image";
import { Droplets, Wind, Sparkles, Shield, Check, Flame, Gauge, Layers } from "lucide-react";

export default function WashingProcessTimeline() {
  const steps = [
    {
      num: "01",
      title: "Pre-Lavado Snow Foam & Descontaminado Férrico",
      time: "10-15 Min",
      badge: "Sin Contacto Físico",
      description:
        "Bañamos la carrocería en una espuma densa pH neutro que encapsula y disuelve el barro, polvo y grasa de carretera sin tocar la pintura. Aplicamos descontaminante férrico especial en rines para remover polvillo de frenos.",
      icon: <Droplets className="w-5 h-5 text-cyan-400" />,
      features: [
        "Espuma con surfactantes biodegradables",
        "Limpieza profunda de calippers y rines",
        "Ablandamiento de bichos y resina de árboles",
      ],
    },
    {
      num: "02",
      title: "Técnica de 2 Baldes & Guante de Lana Merino",
      time: "15-20 Min",
      badge: "Cero Microrrayones",
      description:
        "Un balde con shampoo espumoso y otro balde con agua limpia y trampa de sedimentos (Grit Guard). Cada pasada del guante se enjuaga para no arrastrar impurezas sobre la laca.",
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      features: [
        "Guantes de lana natural ultrablandos",
        "Técnica lineal (nunca circular) para evitar swirls",
        "Agua desmineralizada libre de sarro",
      ],
    },
    {
      num: "03",
      title: "Detallado de Ductos, Emblemas & Motor",
      time: "15-20 Min",
      badge: "Precisión Milimétrica",
      description:
        "Limpiamos con pinceles de cerdas ultra suaves cada parrilla, emblema, bisagra de puerta y ducto de aire acondicionado. Para motores y cadenas de moto utilizamos desengrasante dieléctrico no corrosivo.",
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      features: [
        "Pinceles de cerdas de jabalí suaves",
        "Vaporización a 120°C para eliminar bacterias",
        "Hidratación de plásticos y empaques de caucho",
      ],
    },
    {
      num: "04",
      title: "Secado por Turbina de Aire & Sellado Cerámico",
      time: "10-15 Min",
      badge: "Brillo & Protección",
      description:
        "Expulsamos el agua estancada en espejos, manijas y emblemas con cañón de aire caliente a presión. Finalizamos con aplicación de sellador de SiO2 cerámico o cera carnauba para un tacto ultra suave y repelencia al agua.",
      icon: <Wind className="w-5 h-5 text-emerald-400" />,
      features: [
        "Cero fricción de secado sobre la pintura",
        "Acabado brillante repelente al polvo",
        "Perfume interior premium de larga duración",
      ],
    },
  ];

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto w-full relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Gauge className="w-3.5 h-3.5" />
          <span>Protocolo Técnico Profesional</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          El Proceso de <span className="text-gradient-cyan">Lavado Exclusivo</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
          Cada vehículo que entra a nuestras bahías recibe un tratamiento estandarizado de 4 fases para proteger su valor comercial y dejar un brillo impecable.
        </p>
      </div>

      {/* 4 STEPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {steps.map((st, idx) => (
          <div
            key={idx}
            className="group rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-400/40 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-md relative overflow-hidden"
          >
            {/* Top Step Number Watermark */}
            <div className="absolute top-3 right-4 font-black font-mono text-5xl text-white/[0.04] select-none group-hover:text-cyan-400/10 transition-colors">
              {st.num}
            </div>

            <div>
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 group-hover:border-cyan-400/50 flex items-center justify-center transition-colors shadow-inner">
                  {st.icon}
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                  {st.time}
                </span>
              </div>

              {/* Title & Badge */}
              <div className="mb-3">
                <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider block mb-1">
                  Paso {st.num} • {st.badge}
                </span>
                <h3 className="text-base font-bold text-white leading-snug group-hover:text-cyan-200 transition-colors">
                  {st.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {st.description}
              </p>
            </div>

            {/* Checklist */}
            <div className="pt-3 border-t border-white/5 space-y-1.5">
              {st.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                  <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="line-clamp-1">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
