"use client";

import React from "react";
import Image from "next/image";
import { Coffee, Wifi, MapPin, Clock, ShieldCheck, Sparkles, Navigation, Phone } from "lucide-react";

export default function StudioFacilitiesSection() {
  return (
    <section id="instalaciones" className="py-20 px-4 max-w-7xl mx-auto w-full relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Infraestructura de Estudio</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          Instalaciones de <span className="text-gradient-cyan">Primer Nivel</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
          Diseñado para que tu vehículo reciba el mejor trato y tú disfrutes de una cómoda sala VIP mientras esperas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Photo Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Detailing Bay Image */}
          <div className="sm:col-span-2 relative h-64 sm:h-80 rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
            <Image
              src="/images/detailing_bay.jpg"
              alt="Bahía de Detailing con Iluminación Honeycomb LED"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 720px"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 text-[10px] font-mono font-bold text-cyan-300 uppercase mb-1.5 inline-block">
                BAHÍAS DE LAVADO PROFESIONAL
              </span>
              <h3 className="text-lg font-bold text-white">
                Iluminación Hexagonal Honeycomb 6500K
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Pisos epóxicos antiderrapantes, trampas de sedimentos y pistolas de lavado de baja vibración.
              </p>
            </div>
          </div>

          {/* Interior Detailing Image */}
          <div className="relative h-56 rounded-3xl overflow-hidden border border-white/10 group shadow-xl">
            <Image
              src="/images/interior_detailing.jpg"
              alt="Detallado Interior y Cuidado de Cojinería"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h4 className="text-sm font-bold text-white">Tratamiento de Interiores</h4>
              <p className="text-[11px] text-slate-300">Vapor térmico y cremas hidratantes para cueros.</p>
            </div>
          </div>

          {/* VIP Lounge Perk Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5 flex flex-col justify-between shadow-xl backdrop-blur-md">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Coffee className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Lounge VIP Climatizado</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Café premium de cortesía, WiFi de 500 Mbps, barra de trabajo para laptop y ventanal panorámico a las bahías.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
              <Wifi className="w-3.5 h-3.5" />
              <span>Zona Pet-Friendly & Coworking</span>
            </div>
          </div>
        </div>

        {/* Right Side: Location, Hours & Arrival (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-slate-900/90 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase font-black text-cyan-400 tracking-wider block mb-1">
                SEDE PRINCIPAL
              </span>
              <h3 className="text-2xl font-black text-white">
                Exclusive Studio • Belén Granadas
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Detallado de vehículos • Spa de motos y autos. Calidad, Rapidez y Estilo.
              </p>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Dirección</span>
                <p className="text-sm font-bold text-white">Calle 28 #74A-10 Belén Granadas</p>
                <p className="text-xs text-slate-400">Medellín • Belén Granadas</p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Horario de Atención</span>
                <p className="text-xs font-bold text-white">Lunes a Sábado: 7:30 AM – 7:00 PM</p>
                <p className="text-xs font-medium text-slate-300">Domingos y Festivos: 8:00 AM – 5:00 PM</p>
              </div>
            </div>

            {/* Contact Phone */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-white/10">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Línea Directa / WhatsApp</span>
                <p className="text-xs font-bold text-white">+57 323 311 8393</p>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-6 mt-6 border-t border-white/10 space-y-2.5">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Cl.+28+%2374A-10,+Bel%C3%A9n,+Medell%C3%ADn,+Antioquia,+Colombia"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Abrir en Google Maps / Waze</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
