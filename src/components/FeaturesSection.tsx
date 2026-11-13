"use client";

import React from "react";
import { ShieldCheck, Droplets, Zap, Coffee, Sparkles, Award } from "lucide-react";

export default function FeaturesSection() {
  const perks = [
    {
      icon: <Droplets className="w-6 h-6 text-cyan-400" />,
      title: "Espuma pH Neutro & Agua Suavizada",
      description: "Lavamos con agua desmineralizada y shampoos hidrófobos que no barren ceras ni manchan la laca original.",
    },
    {
      icon: <Award className="w-6 h-6 text-blue-400" />,
      title: "Técnica de 2 Baldes & Guante de Lana",
      description: "Cero remolinos (swirls). Microfibras de 800 GSM y rejillas trampa de arena para proteger tu pintura al 100%.",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Desengrase Seguro de Motor & Cadena",
      description: "Para carros y motos: productos dieléctricos biodegradables y vaporización térmica que no dañan sensores.",
    },
    {
      icon: <Coffee className="w-6 h-6 text-emerald-400" />,
      title: "Zona Lounge VIP Climatizada",
      description: "Espera cómodamente con Wi-Fi de alta velocidad, café express de cortesía y vista panorámica a la bahía.",
    },
  ];

  return (
    <section id="por-que-nosotros" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Estándares de Calidad</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Por qué elegir nuestro <span className="text-gradient-cyan">Studio de Detallado</span>
        </h2>
        <p className="text-slate-400 text-sm mt-3">
          No somos un lavadero convencional de manguera a presión. Cuidamos cada rincón de tu vehículo con técnica profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {perks.map((item, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
