"use client";

import React, { useState } from "react";
import { SERVICES_LIST, formatCurrency, ServiceItem } from "@/data/servicesData";
import { VehicleType } from "./ThreeVehicleCanvas";
import { Clock, CheckCircle2, Sparkles, Flame, ShieldAlert, ArrowRight } from "lucide-react";

interface ServicesSectionProps {
  currentVehicle: VehicleType;
  onSelectService: (service: ServiceItem, vehicle: VehicleType) => void;
}

export default function ServicesSection({ currentVehicle, onSelectService }: ServicesSectionProps) {
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>(currentVehicle);

  const vehicleLabels: Record<VehicleType, { name: string; icon: string }> = {
    carro: { name: "Automóvil / Sedán", icon: "🚗" },
    camioneta: { name: "Camioneta / SUV", icon: "🚙" },
    moto: { name: "Motocicleta", icon: "🏍️" },
  };

  const filteredServices = SERVICES_LIST.filter((s) => {
    if (s.category === "todos") return true;
    return s.category === selectedVehicleType;
  });

  return (
    <section id="servicios" className="py-20 px-4 max-w-7xl mx-auto relative">
      {/* Decorative ambient lights */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Carta de Tratamientos & Precios</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Servicios Profesionales de <span className="text-gradient-cyan">Detallado</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Tratamientos especializados con productos pH neutro, ceras de alto rendimiento y técnicas anti-rayones. Selecciona tu tipo de vehículo para ver tarifas exactas.
        </p>

        {/* Vehicle filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
          {(["carro", "camioneta", "moto"] as VehicleType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedVehicleType(type)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                selectedVehicleType === type
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-105"
                  : "bg-slate-900/80 text-slate-300 border border-white/10 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span>{vehicleLabels[type].icon}</span>
              <span>{vehicleLabels[type].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredServices.map((service) => {
          const price = service.prices[selectedVehicleType];
          if (price === 0) return null; // service not available for this vehicle

          return (
            <div
              key={service.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between glass-card glass-card-hover ${
                service.isPopular
                  ? "border-cyan-500/40 ring-1 ring-cyan-500/30"
                  : service.isPremium
                  ? "border-amber-500/30 ring-1 ring-amber-500/20"
                  : "border-white/10"
              }`}
            >
              {/* Badges */}
              {service.isPopular && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-black" />
                  <span>Más Solicitado</span>
                </div>
              )}
              {service.isPremium && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-black" />
                  <span>Gama Premium</span>
                </div>
              )}

              <div>
                {/* Duration & Category */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>~{service.durationMinutes} minutos aprox.</span>
                  </div>
                  <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5">
                    {vehicleLabels[selectedVehicleType].icon} {selectedVehicleType}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-cyan-300 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
                  {service.description}
                </p>

                {/* Inclusions list */}
                <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                  <p className="text-[11px] uppercase font-bold text-slate-300 tracking-wider">
                    ¿Qué incluye este servicio?
                  </p>
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="pt-5 border-t border-white/10 flex items-center justify-between gap-4 mt-auto">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                    Tarifa {vehicleLabels[selectedVehicleType].name}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {formatCurrency(price)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectService(service, selectedVehicleType)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-cyan-500 hover:text-black text-white border border-white/15 hover:border-cyan-400 transition-all duration-300 active:scale-95 group"
                >
                  <span>Elegir</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
