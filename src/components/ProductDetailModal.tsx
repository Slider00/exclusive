"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { DetailingProduct } from "@/data/productsData";
import { formatCurrency, BUSINESS_CONFIG } from "@/data/servicesData";
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FlaskConical,
  Droplets,
  Calendar,
  MessageCircle,
  Layers,
  Award,
  Clock,
} from "lucide-react";

interface ProductDetailModalProps {
  product: DetailingProduct | null;
  onClose: () => void;
  onScrollToBooking?: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onScrollToBooking,
}: ProductDetailModalProps) {
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${BUSINESS_CONFIG.shortName}, me interesa el producto *${product.name}* (${formatCurrency(
      product.price
    )}) y quiero información sobre su aplicación o compra.`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-[#0a0f18] border border-cyan-500/30 shadow-[0_25px_90px_rgba(6,182,212,0.22)] overflow-hidden text-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-lg"
          aria-label="Cerrar detalle del producto"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Studio Product Visual & Quick Specs (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-white/10 p-5 sm:p-6 flex flex-col justify-between relative">
              <div>
                {/* Category & AI Preview Tag */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                    {product.categoryLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-semibold">
                    Insumo Oficial de Bahía
                  </span>
                </div>

                {/* Product Image Frame */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 shadow-inner group">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    unoptimized={
                      product.image.startsWith("data:") || product.image.startsWith("http")
                    }
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-cyan-400/30 backdrop-blur-md text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {product.badge}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 backdrop-blur-md text-[10px] font-mono text-slate-300">
                      {product.presentation.split("(")[0].trim()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Datasheet Grid */}
              <div className="grid grid-cols-1 gap-2.5 mt-4">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <FlaskConical className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Fórmula & Balance Químico
                    </span>
                    <span className="text-xs font-bold text-white block truncate">
                      {product.phLevel} • {product.techSpec}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Rendimiento / Protección
                    </span>
                    <span className="text-xs font-bold text-white block truncate">
                      {product.protectionDuration}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Information, Benefits & Actions (7 cols) */}
            <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-5">
                {/* Brand & Title */}
                <div>
                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                    {product.brandLine}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent border border-cyan-500/25 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-cyan-300 block">
                      Precio Unidad / Lleva a Casa ({product.presentation})
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        • Incluido sin costo extra en lavados seleccionados
                      </span>
                    </div>
                  </div>
                </div>

                {/* How we apply it in the studio */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                    <Droplets className="w-4 h-4" />
                    <span>¿Cómo lo aplicamos en tu vehículo?</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {product.howWeUseIt}
                  </p>
                </div>

                {/* Benefits Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Beneficios Técnicos Comprobados</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.benefits.map((benefit, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2 text-xs text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compatible Surfaces & Included Services */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>Superficies Compatibles</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {product.applicationAreas.map((area, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Incluido en los Servicios</span>
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {product.includedInServices.map((srv, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-semibold text-cyan-300"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onScrollToBooking) onScrollToBooking();
                  }}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar Lavado con este Producto</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm bg-[#25D366]/15 hover:bg-[#25D366] text-[#4ade80] hover:text-slate-950 border border-[#25D366]/35 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Encargar Producto</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

