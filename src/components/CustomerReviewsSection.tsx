"use client";

import React from "react";
import { Star, ShieldCheck, CheckCircle2, Car, Truck, Bike, MessageSquare } from "lucide-react";

export default function CustomerReviewsSection() {
  const reviews = [
    {
      name: "Carlos Mendoza",
      vehicle: "BMW M340i xDrive",
      type: "carro",
      service: "Lavado Full Detailing + Cera SiO2",
      rating: 5,
      date: "Hace 3 días",
      text: "El mejor lavado técnico de la ciudad sin duda. Mi carro es negro metalizado y en otros lugares siempre me dejaban microrrayones circulares. Aquí la pintura quedó como un espejo sin un solo swirl.",
    },
    {
      name: "Valentina Restrepo",
      vehicle: "Mazda CX-30 Grand Touring",
      type: "camioneta",
      service: "Lavado Full + Desinfección Ozono",
      rating: 5,
      date: "Hace 1 semana",
      text: "Poder agendar desde el celular en 30 segundos sin registros fastidiosos y ver cómo avanza el lavado por la cámara en vivo es de otro planeta. Además el café de cortesía en el lounge es delicioso.",
    },
    {
      name: "Andrés Camilo Duarte",
      vehicle: "Ducati Monster 821",
      type: "moto",
      service: "Lavado Técnico de Moto + Cadena",
      rating: 5,
      date: "Hace 2 semanas",
      text: "Muy difícil encontrar un lavadero que sepa tratar motos de alto cilindraje. Desengrasaron la cadena con producto dieléctrico sin tocar los sensores y la dejaron lista para rodar. Recomendadísimo.",
    },
    {
      name: "Guillermo Silva",
      vehicle: "Toyota Prado TX-L",
      type: "camioneta",
      service: "Desmanchado & Restauración Interior",
      rating: 5,
      date: "Hace 3 semanas",
      text: "Traje mi camioneta después de un viaje al campo llena de barro. El lavado de chasis a presión y el aspirado minucioso de ductos la dejaron oliendo a nuevo. El recibo por WhatsApp muy práctico.",
    },
  ];

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto w-full relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>Experiencias Verificadas</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          La Voz de Quienes <span className="text-gradient-cyan">Confían en Nosotros</span>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-300">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-bold text-white">4.9 de 5.0</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Más de 380 reseñas en Google</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
          >
            <div>
              {/* Stars & Date */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4 italic">
                "{rev.text}"
              </p>
            </div>

            {/* Author & Vehicle */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{rev.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  </p>
                  <p className="text-[11px] text-cyan-400 font-medium">{rev.vehicle}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{rev.service}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
