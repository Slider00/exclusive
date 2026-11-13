"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, MapPin, Phone, Clock, MessageCircle, Share2, Globe } from "lucide-react";
import { BUSINESS_CONFIG } from "@/data/servicesData";

interface FooterBubble {
  id: number;
  xPercent: number;
  bottomOffset: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Footer() {
  const [poppedBubbles, setPoppedBubbles] = useState<number[]>([]);

  // Subtle 3D floating soap bubbles rising from the foam bed
  const footerBubbles: FooterBubble[] = [
    { id: 1, xPercent: 5, bottomOffset: 35, size: 28, duration: 5.2, delay: 0 },
    { id: 2, xPercent: 14, bottomOffset: 55, size: 40, duration: 6.0, delay: 1.2 },
    { id: 3, xPercent: 24, bottomOffset: 25, size: 22, duration: 4.8, delay: 0.5 },
    { id: 4, xPercent: 35, bottomOffset: 65, size: 36, duration: 5.5, delay: 1.8 },
    { id: 5, xPercent: 48, bottomOffset: 40, size: 44, duration: 6.2, delay: 0.3 },
    { id: 6, xPercent: 62, bottomOffset: 70, size: 32, duration: 5.0, delay: 1.5 },
    { id: 7, xPercent: 74, bottomOffset: 30, size: 26, duration: 4.5, delay: 0.8 },
    { id: 8, xPercent: 86, bottomOffset: 50, size: 42, duration: 5.8, delay: 0.2 },
    { id: 9, xPercent: 94, bottomOffset: 35, size: 24, duration: 5.1, delay: 1.4 },
  ];

  const handlePopBubble = (id: number) => {
    setPoppedBubbles((prev) => [...prev, id]);
    setTimeout(() => {
      setPoppedBubbles((prev) => prev.filter((item) => item !== id));
    }, 3000);
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#040609] py-14 px-4 text-slate-400 text-xs overflow-hidden">
      {/* 1. FULL FOOTER BACKGROUND: Subtle Foam & Floating Bubbles (Magnific Vector Style) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        {/* Foam & Bubbles Texture with Soft Opacity */}
        <div
          className="absolute inset-0 w-full h-full mix-blend-screen opacity-25"
          style={{
            backgroundImage: "url('/images/footer_foam_banner.jpg')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center 60%",
            filter: "contrast(120%) brightness(105%)",
          }}
        />

        {/* Soft Radial & Linear Vignette for High Contrast & Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040609]/90 via-[#040609]/60 to-[#040609]/95 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,240,255,0.06),transparent_70%)] pointer-events-none" />

        {/* 2. Delicate Interactive Floating 3D Soap Bubbles */}
        {footerBubbles.map((bubble) => {
          const isPopped = poppedBubbles.includes(bubble.id);
          if (isPopped) {
            return (
              <div
                key={bubble.id}
                className="absolute animate-ping pointer-events-none"
                style={{
                  left: `${bubble.xPercent}%`,
                  bottom: `${bubble.bottomOffset}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                }}
              >
                <div className="w-full h-full rounded-full border border-cyan-400/80 scale-125" />
              </div>
            );
          }

          return (
            <div
              key={bubble.id}
              onClick={() => handlePopBubble(bubble.id)}
              className="absolute pointer-events-auto cursor-pointer group transition-transform duration-300 hover:scale-125 opacity-75 hover:opacity-100"
              style={{
                left: `${bubble.xPercent}%`,
                bottom: `${bubble.bottomOffset}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                animation: `footerBubbleFloat ${bubble.duration}s ease-in-out infinite alternate`,
                animationDelay: `${bubble.delay}s`,
              }}
              title="¡Explota la burbuja!"
            >
              {/* Outer 3D Glass Sphere */}
              <div
                className="relative w-full h-full rounded-full border border-white/40 backdrop-blur-[0.5px] shadow-[inset_0_0_8px_rgba(255,255,255,0.3),0_2px_12px_rgba(0,240,255,0.15)]"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.04) 50%, rgba(0,240,255,0.15) 85%, rgba(186,230,253,0.2) 100%)",
                }}
              >
                {/* Specular White Gloss Crescent */}
                <div
                  className="absolute rounded-full bg-white opacity-90 blur-[0.2px]"
                  style={{
                    top: "14%",
                    left: "18%",
                    width: "36%",
                    height: "20%",
                    transform: "rotate(-35deg)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 100%)",
                  }}
                />
                {/* Secondary Micro-Highlight */}
                <div
                  className="absolute rounded-full bg-white opacity-90"
                  style={{
                    top: "28%",
                    left: "15%",
                    width: "12%",
                    height: "12%",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FOOTER CONTENT GRID (Free-standing, Clean Typography without Containers) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="inline-block group" title="Exclusive Detallado de Vehículos">
            <Image
              src="/images/logo.png?v=4"
              alt="Exclusive Detallado de Vehículos - Spa de Motos y Autos"
              width={220}
              height={60}
              unoptimized
              className="h-14 sm:h-16 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
            />
          </Link>
          <p className="text-slate-200 text-xs leading-relaxed">
            Especialistas en embellecimiento, lavado técnico Snow Foam pH neutro y protección cerámica para autos y motos de alto cilindraje.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors" title="Sitio Web">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors" title="Compartir">
              <Share2 className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                BUSINESS_CONFIG.defaultWhatsAppMessage
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-200"
              title="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Horarios */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Horario de Atención
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex justify-between border-b border-white/10 pb-1.5">
              <span className="text-slate-300">Lunes a Viernes:</span>
              <span className="text-white font-medium">8:00 AM – 6:30 PM</span>
            </li>
            <li className="flex justify-between border-b border-white/10 pb-1.5">
              <span className="text-slate-300">Sábados:</span>
              <span className="text-white font-medium">7:30 AM – 7:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-300">Domingos & Festivos:</span>
              <span className="text-white font-medium">8:30 AM – 4:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Ubicación */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Ubicación & Contacto
          </h4>
          <p className="text-xs leading-relaxed text-slate-200">
            Calle 28 #74A-10 Belén Granadas • Medellín.<br />
            Calidad, Rapidez y Estilo. Bahía de lavado para autos, camionetas y motos.
          </p>
          <div className="pt-2 border-t border-white/10">
            <span className="block text-slate-400 text-[11px]">Línea WhatsApp Directa:</span>
            <span className="font-mono text-cyan-400 font-bold text-sm">{BUSINESS_CONFIG.phone}</span>
          </div>
        </div>

        {/* Servicios Rápidos */}
        <div className="space-y-3.5">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Tratamientos Destacados
          </h4>
          <ul className="space-y-2 text-xs text-slate-200">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Lavado Full con Espuma pH Neutro
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Desengrasada de Motor Dieléctrica
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Detailing Especial de Cadena para Motos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Corrección de Pintura y Sellado Cerámico
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Hidratación de Plásticos & Cuero
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright row */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 relative z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
        <p>© 2026 Exclusive Detailing Studio. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium">
            <span>Panel de Administración</span>
          </Link>
          <span className="text-slate-700">•</span>
          <p className="text-slate-400">
            Tecnología Snow Foam & Detailing Pro.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes footerBubbleFloat {
          0% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-12px) translateX(5px);
          }
          100% {
            transform: translateY(-24px) translateX(-5px);
          }
        }
      `}</style>
    </footer>
  );
}
