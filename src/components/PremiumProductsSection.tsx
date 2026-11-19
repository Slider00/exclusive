"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  PREMIUM_PRODUCTS,
  DetailingProduct,
  getStoredProducts,
  syncProductsWithBackend,
  PRODUCTS_UPDATED_EVENT,
} from "@/data/productsData";
import { formatCurrency } from "@/data/servicesData";
import { getProductsSectionEnabled } from "@/data/adminStore";
import {
  FlaskConical,
  Sparkles,
  Eye,
  Check,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PremiumProductsSectionProps {
  onSelectProduct: (product: DetailingProduct) => void;
}

export default function PremiumProductsSection({
  onSelectProduct,
}: PremiumProductsSectionProps) {
  const [products, setProducts] = useState<DetailingProduct[]>(PREMIUM_PRODUCTS);
  const [isSectionEnabled, setIsSectionEnabled] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(getStoredProducts());
    setIsSectionEnabled(getProductsSectionEnabled());
    syncProductsWithBackend()
      .then((fresh) => {
        setProducts(fresh);
        setIsSectionEnabled(getProductsSectionEnabled());
      })
      .catch(() => {});

    const handleUpdate = () => {
      setProducts(getStoredProducts());
      setIsSectionEnabled(getProductsSectionEnabled());
    };
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("exclusive_products_visibility_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("exclusive_products_visibility_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const categories = [
    { id: "todos", label: "Todos los Insumos" },
    { id: "exterior", label: "Champú & Pre-Lavado" },
    { id: "proteccion", label: "Ceras & Cerámicos" },
    { id: "rines-motor", label: "Rines, Motor & Motos" },
    { id: "interior", label: "Cabina & Cuero UV" },
  ];

  const filteredProducts =
    activeCategory === "todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = trackRef.current;
      if (!container || filteredProducts.length === 0) return;

      const safeIndex =
        ((index % filteredProducts.length) + filteredProducts.length) %
        filteredProducts.length;
      const cards = container.querySelectorAll<HTMLElement>("[data-product-card]");
      const targetCard = cards[safeIndex];

      if (targetCard) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        const targetLeft = Math.min(targetCard.offsetLeft, Math.max(0, maxScrollLeft));

        // If we are already at the right edge and advancing forward, wrap back to 0
        if (
          safeIndex > activeIndex &&
          container.scrollLeft >= maxScrollLeft - 12 &&
          maxScrollLeft > 0
        ) {
          container.scrollTo({ left: 0, behavior: "smooth" });
          setActiveIndex(0);
          return;
        }

        container.scrollTo({ left: targetLeft, behavior: "smooth" });
        setActiveIndex(safeIndex);
      }
    },
    [filteredProducts.length, activeIndex]
  );

  // Reset carousel to start when category changes
  useEffect(() => {
    setActiveIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeCategory]);

  // Automatic carousel movement every 3.5 seconds (pauses on hover/touch)
  useEffect(() => {
    if (isPaused || filteredProducts.length <= 1) return;

    const timer = setInterval(() => {
      const nextIdx = (activeIndex + 1) % filteredProducts.length;
      scrollToIndex(nextIdx);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, activeIndex, filteredProducts.length, scrollToIndex]);

  // Sync active dot when user swipes manually on mobile/trackpad
  const handleTrackScroll = () => {
    const container = trackRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>("[data-product-card]");
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth + 24;
    const approxIndex = Math.round(container.scrollLeft / Math.max(1, cardWidth));
    const clamped = Math.max(0, Math.min(filteredProducts.length - 1, approxIndex));
    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
    }
  };

  if (!isSectionEnabled) return null;

  return (
    <section id="productos" className="py-20 px-4 max-w-7xl mx-auto w-full relative">
      {/* Ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Química Automotriz de Grado Studio</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Productos <span className="text-gradient-cyan">Premium</span> que Cuidan tu Vehículo
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Cero detergentes agresivos ni siliconas grasosas. Conoce las fórmulas de pH neutro, ceras de carnauba y polímeros cerámicos SiO2 que aplicamos en nuestras bahías o que puedes adquirir para el cuidado en casa. Haz clic en cualquier producto para ver su ficha técnica.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-7">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105"
                  : "bg-slate-900/80 text-slate-300 border border-white/10 hover:border-cyan-500/35 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Single-Row Auto-Sliding Carousel Wrapper */}
      <div
        className="relative z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left / Right Floating Navigation Arrows */}
        {filteredProducts.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              aria-label="Producto anterior"
              className="hidden md:flex absolute -left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/90 hover:bg-cyan-500 text-white hover:text-slate-950 border border-white/15 hover:border-cyan-400 shadow-2xl items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              aria-label="Siguiente producto"
              className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/90 hover:bg-cyan-500 text-white hover:text-slate-950 border border-white/15 hover:border-cyan-400 shadow-2xl items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Single Horizontal Line Track */}
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="flex flex-nowrap gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 pt-2 px-1"
        >
          {filteredProducts.map((product) => {
            const isCustomImg =
              product.image.startsWith("data:") || product.image.startsWith("http");

            return (
              <div
                key={product.id}
                data-product-card
                onClick={() => onSelectProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProduct(product);
                  }
                }}
                className="snap-start shrink-0 w-[86vw] sm:w-[340px] lg:w-[380px] group rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/50 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/15 backdrop-blur-xl cursor-pointer"
              >
                <div>
                  {/* Product Studio Photo Container */}
                  <div className="relative w-full h-60 overflow-hidden bg-slate-950 border-b border-white/10">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized={isCustomImg}
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 640px) 86vw, 380px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-black/75 border border-cyan-400/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {product.categoryLabel}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/75 border border-white/15 backdrop-blur-md text-[10px] font-mono font-semibold text-emerald-400">
                        {product.phLevel}
                      </span>
                    </div>

                    {/* Bottom overlay badge inside photo */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-200 bg-black/70 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5 min-w-0">
                        <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{product.badge}</span>
                      </span>

                      <span className="w-8 h-8 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 border border-cyan-400/30 flex items-center justify-center transition-all shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-mono mb-1.5">
                      <span className="truncate">{product.presentation}</span>
                      <span className="text-cyan-400 font-semibold shrink-0">• En Bahía</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2 line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
                      {product.summary}
                    </p>

                    {/* Mini highlights */}
                    <div className="space-y-1.5 pt-3 border-t border-white/5">
                      {product.benefits.slice(0, 2).map((b, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-slate-300"
                        >
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="line-clamp-1">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price + Open Modal Button */}
                <div className="px-5 sm:px-6 py-4 bg-slate-950/60 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Precio Unidad / Insumo
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 group-hover:bg-cyan-500 text-white group-hover:text-slate-950 border border-white/15 group-hover:border-cyan-400 transition-all flex items-center gap-1.5 shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalle</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Dots & Mobile Prev/Next Controls */}
        {filteredProducts.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              className="md:hidden w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {filteredProducts.map((prod, idx) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Ir al producto ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? "w-7 bg-cyan-400 shadow-sm shadow-cyan-400/50"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              className="md:hidden w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center justify-center cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
