"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import RealVehicleVideoShowcase from "@/components/RealVehicleVideoShowcase";
import { VehicleType } from "@/data/servicesData";
import LiveStudioStatusStrip from "@/components/LiveStudioStatusStrip";
import ServicesSection from "@/components/ServicesSection";
import BeforeAfterTransformation from "@/components/BeforeAfterTransformation";
import WashingProcessTimeline from "@/components/WashingProcessTimeline";
import BookingSection from "@/components/BookingSection";
import StudioFacilitiesSection from "@/components/StudioFacilitiesSection";
import CustomerReviewsSection from "@/components/CustomerReviewsSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import TrackVehicleModal from "@/components/TrackVehicleModal";
import PremiumProductsSection from "@/components/PremiumProductsSection";
import ProductDetailModal from "@/components/ProductDetailModal";
import { DetailingProduct } from "@/data/productsData";
import { ServiceItem, SERVICES_LIST, BUSINESS_CONFIG } from "@/data/servicesData";
import { Calendar, ShieldCheck, Sparkles, Clock, ArrowRight, MessageCircle, Star } from "lucide-react";
import ExclusiveSplashPreloader from "@/components/ExclusiveSplashPreloader";
import GrandOpeningModal from "@/components/GrandOpeningModal";

export default function HomePage() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("carro");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(SERVICES_LIST[1]); // Default to Lavado Full
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackedVehicle, setTrackedVehicle] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DetailingProduct | null>(null);

  const handleTuneMainCamera = (booking: any) => {
    setTrackedVehicle(booking);
    setIsTrackerOpen(false);
    const camEl = document.getElementById("experiencia-video");
    if (camEl) {
      camEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectServiceFromCatalog = (service: ServiceItem, vehicle: VehicleType) => {
    setSelectedService(service);
    setSelectedVehicle(vehicle);
    // Smooth scroll to booking
    const bookingEl = document.getElementById("agendar");
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToBooking = () => {
    const bookingEl = document.getElementById("agendar");
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="relative min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black"
      suppressHydrationWarning
    >
      {/* Luxury Brand Splash Screen (auto-terminates smoothly in 850ms) */}
      <ExclusiveSplashPreloader />

      {/* Background ambient lighting (GPU-safe on mobile) */}
      <div className="hidden md:block fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-[140px] pointer-events-none z-0" />

      {/* Navigation */}
      <Navbar
        onOpenTracker={() => setIsTrackerOpen(true)}
        onScrollToBooking={scrollToBooking}
      />

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-20 px-4 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text & CTA (6 cols) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experiencia Studio Detailing & Lavado Pro</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Cuidado Milimétrico para tu{" "}
              <span className="text-gradient-cyan">Auto o Moto</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Agenda tu turno en menos de 30 segundos con solo tu placa y WhatsApp. Cero logins ni registros tediosos. Tratamientos con espuma pH neutro, desengrasado técnico y acabado espejo.
            </p>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={scrollToBooking}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-slate-950 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 active:scale-95 touch-manipulation cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Cita en 30s</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTrackerOpen(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm bg-white/[0.05] hover:bg-white/[0.1] active:bg-cyan-500/10 text-white border border-white/10 hover:border-cyan-400/40 transition-all flex items-center justify-center gap-2 touch-manipulation cursor-pointer active:scale-95"
              >
                <span>Consultar por Placa</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Micro value badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sin Registro Requerido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Horas en Tiempo Real</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>4.9 / 5 Calificación</span>
              </div>
            </div>
          </div>

          {/* Right Real Vehicle Video & Studio Showcase (6 cols) */}
          <div id="experiencia-video" className="lg:col-span-6 w-full">
            <RealVehicleVideoShowcase
              onOpenTracker={() => setIsTrackerOpen(true)}
              onScrollToBooking={scrollToBooking}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
              trackedVehicle={trackedVehicle}
              onClearTracked={() => setTrackedVehicle(null)}
            />
          </div>
        </div>
      </section>

      {/* 1. LIVE STUDIO STATUS STRIP (Bahías en tiempo real) */}
      <LiveStudioStatusStrip />

      {/* QUICK STATS METRICS STRIP */}
      <section className="border-y border-white/10 bg-slate-950/40 py-8 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">1,500+</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Vehículos Lavados</p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-cyan-400 tracking-tight">30s</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Agendamiento Rápido</p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">100%</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Cero Microrrayones</p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">0</span>
            <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Logins o Contraseñas</p>
          </div>
        </div>
      </section>

      {/* 2. SERVICES & PRICING CATALOG */}
      <ServicesSection
        currentVehicle={selectedVehicle}
        onSelectService={handleSelectServiceFromCatalog}
      />

      {/* 3. INTERACTIVE BEFORE & AFTER SLIDER */}
      <div id="transformacion" className="content-visibility-auto">
        <BeforeAfterTransformation onScrollToBooking={scrollToBooking} />
      </div>

      {/* 4. 4-STAGE TECHNICAL WASHING PROTOCOL */}
      <div id="proceso" className="content-visibility-auto">
        <WashingProcessTimeline />
      </div>

      {/* 4.5. PREMIUM DETAILING PRODUCTS & CHEMISTRY SHOWCASE */}
      <div className="content-visibility-auto">
        <PremiumProductsSection onSelectProduct={(prod) => setSelectedProduct(prod)} />
      </div>

      {/* 5. ZERO-LOGIN CUSTOMER BOOKING SECTION */}
      <BookingSection
        selectedService={selectedService}
        selectedVehicle={selectedVehicle}
        onVehicleChange={(type) => setSelectedVehicle(type)}
        onServiceChange={(serv) => setSelectedService(serv)}
      />

      {/* 6. STUDIO FACILITIES & VIP LOUNGE */}
      <div className="content-visibility-auto">
        <StudioFacilitiesSection />
      </div>

      {/* 7. CUSTOMER REVIEWS & GOOGLE RATINGS */}
      <div className="content-visibility-auto">
        <CustomerReviewsSection />
      </div>

      {/* 8. FEATURES / QUALITY STANDARDS */}
      <div className="content-visibility-auto">
        <FeaturesSection />
      </div>

      {/* FOOTER */}
      <Footer />

      {/* TRACK VEHICLE POPUP MODAL */}
      <TrackVehicleModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onTuneMainCamera={handleTuneMainCamera}
        initialPlate={trackedVehicle?.licensePlate}
      />

      {/* PRODUCT DETAIL POPUP MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onScrollToBooking={scrollToBooking}
      />

      {/* GRAND OPENING WELCOME MODAL (1x per session) */}
      <GrandOpeningModal onScrollToBooking={scrollToBooking} />

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encodeURIComponent(
          BUSINESS_CONFIG.defaultWhatsAppMessage
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-3 sm:p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group shadow-[#25D366]/40 border-2 border-white/20"
        title="Escríbenos por WhatsApp"
      >
        {/* Official WhatsApp Vector Logo */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white shrink-0 drop-shadow-sm"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold text-white pl-0 group-hover:pl-2.5">
          WhatsApp Directo
        </span>
      </a>
    </div>
  );
}
