"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Droplets,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Video,
  Camera,
  Search,
  Calendar,
  Gauge,
  CheckCircle2,
  Radio,
  ShieldCheck,
  FlaskConical,
  Eye,
  ChevronRight,
  Car,
  Truck,
  Bike,
} from "lucide-react";
import {
  PREMIUM_PRODUCTS,
  DetailingProduct,
  getStoredProducts,
  PRODUCTS_UPDATED_EVENT,
} from "@/data/productsData";
import { formatCurrency, VehicleType } from "@/data/servicesData";

interface RealVehicleVideoShowcaseProps {
  onOpenTracker?: () => void;
  onScrollToBooking?: () => void;
  onSelectProduct?: (product: DetailingProduct) => void;
  vehicleType?: VehicleType;
  onVehicleChange?: (type: VehicleType) => void;
  trackedVehicle?: any | null;
  onClearTracked?: () => void;
}

const SHOWCASE_INFO: Record<
  VehicleType,
  {
    label: string;
    shortLabel: string;
    badge: string;
    title: string;
    subtitle: string;
    videoSrc: string;
    posterSrc: string;
  }
> = {
  carro: {
    label: "Automóvil",
    shortLabel: "Auto",
    badge: "Protocolo Sedán & Deportivos",
    title: "Demostración: Lavado & Detailing Automóvil",
    subtitle: "Espuma activa pH 7.0 neutro, técnica de 2 baldes y sellado hidrofóbico SiO2",
    videoSrc: "/videos/wash_carro.mp4?v=2",
    posterSrc: "/images/wash_carro.jpg",
  },
  camioneta: {
    label: "Camioneta",
    shortLabel: "SUV / 4x4",
    badge: "Protocolo SUV & Pickups",
    title: "Demostración: Lavado Profundo Camioneta & 4x4",
    subtitle: "Desengrasado de guardabarros, descontaminado de rines y protección cerámica",
    videoSrc: "/videos/wash_camioneta.mp4?v=2",
    posterSrc: "/images/wash_camioneta.jpg",
  },
  moto: {
    label: "Moto",
    shortLabel: "Moto",
    badge: "Protocolo Motocicletas",
    title: "Demostración: Detailing Técnico de Motocicleta",
    subtitle: "Desengrase dieléctrico seguro, lubricación de kit de arrastre y brillo UV",
    videoSrc: "/videos/wash_moto.mp4?v=2",
    posterSrc: "/images/wash_moto.jpg",
  },
};

export default function RealVehicleVideoShowcase({
  onOpenTracker,
  onScrollToBooking,
  onSelectProduct,
  vehicleType = "carro",
  onVehicleChange,
  trackedVehicle,
  onClearTracked,
}: RealVehicleVideoShowcaseProps) {
  const [viewMode, setViewMode] = useState<"video" | "photo">("video");
  const [selectedShowcaseVehicle, setSelectedShowcaseVehicle] =
    useState<VehicleType>(vehicleType);
  const [activeCam, setActiveCam] = useState<"cam1" | "cam2">("cam1");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [videoError, setVideoError] = useState<boolean>(false);
  const [bayProducts, setBayProducts] = useState<DetailingProduct[]>(PREMIUM_PRODUCTS);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setBayProducts(getStoredProducts());
    const handleUpdate = () => setBayProducts(getStoredProducts());
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Live CCTV digital clock update (used only when a real vehicle plate is being tracked)
  useEffect(() => {
    if (!trackedVehicle) return;
    const updateClock = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const d = pad(now.getDate());
      const m = pad(now.getMonth() + 1);
      const y = now.getFullYear();
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      const ss = pad(now.getSeconds());
      setCurrentTime(`${d}/${m}/${y} ${hh}:${mm}:${ss}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [trackedVehicle]);

  // Performance: Auto-pause video when scrolled out of view to maintain 60 FPS
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            if (!videoEl.paused) {
              videoEl.pause();
            }
          } else {
            if (isPlaying && videoEl.paused) {
              videoEl.play().catch(() => {});
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSelectVehicleTab = (type: VehicleType) => {
    setSelectedShowcaseVehicle(type);
    setVideoError(false);
    if (onVehicleChange) {
      onVehicleChange(type);
    }
  };

  const handleScrollToBooking = () => {
    if (onScrollToBooking) {
      onScrollToBooking();
    } else {
      const el = document.getElementById("agendar");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToProducts = () => {
    const el = document.getElementById("productos");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const activeShowcase = SHOWCASE_INFO[selectedShowcaseVehicle] || SHOWCASE_INFO.carro;

  // Select video feed based on vehicle tracked or promotional vehicle selector
  const currentVideoSrc = trackedVehicle
    ? trackedVehicle.vehicleType === "moto"
      ? "/videos/wash_moto.mp4?v=2"
      : trackedVehicle.vehicleType === "camioneta"
      ? "/videos/wash_camioneta.mp4?v=2"
      : "/videos/wash_carro.mp4?v=2"
    : activeShowcase.videoSrc;

  const currentPoster = trackedVehicle
    ? trackedVehicle.vehicleType === "moto"
      ? "/images/wash_moto.jpg"
      : trackedVehicle.vehicleType === "camioneta"
      ? "/images/wash_camioneta.jpg"
      : "/images/wash_carro.jpg"
    : activeShowcase.posterSrc;

  const featuredBayProducts = bayProducts.slice(0, 3);

  return (
    <div className="relative w-full rounded-3xl bg-slate-900/80 border border-white/10 p-4 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col gap-3.5">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. HEADER BAR: PROMOTIONAL STUDIO SHOWROOM BY DEFAULT, OR TRACKED VEHICLE CAMERA */}
      {/* 1. HEADER BAR: SHOWROOM STUDIO DEMOSTRATIVO */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-1.5 border-b border-white/5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-black text-white">
                EXPERIENCIA STUDIO & PROCESO DE LAVADO
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-cyan-500/15 border-cyan-500/30 text-cyan-300">
                Video Demostrativo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              Conoce cómo aplicamos nuestro protocolo sin contacto y química pH neutro
            </p>
          </div>
        </div>

        {/*
          [MODO CÁMARAS EN VIVO DE BAHÍA - TEMPORALMENTE COMENTADO HASTA INSTALACIÓN DE HARDWARE CCTV]
          {trackedVehicle && (
            <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl shrink-0">
              <button onClick={() => setActiveCam("cam1")}>CAM Bahía</button>
              <button onClick={() => setActiveCam("cam2")}>CAM Detallado</button>
            </div>
          )}
        */}

        {/* Switcher: Vehicle Type Tabs (Auto, Camioneta, Moto) */}
        <div className="flex items-center gap-1 p-1 bg-black/60 border border-white/10 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => handleSelectVehicleTab("carro")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedShowcaseVehicle === "carro"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Auto</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectVehicleTab("camioneta")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedShowcaseVehicle === "camioneta"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Camioneta</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectVehicleTab("moto")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedShowcaseVehicle === "moto"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Moto</span>
          </button>
        </div>
      </div>

      {/* 2. VIDEO PLAYER FRAME */}
      <div className="relative z-10 w-full aspect-video sm:h-[360px] rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner group">
        {/* Main Video or Photo Mode */}
        {viewMode === "video" && !videoError ? (
          <video
            ref={videoRef}
            key={`${currentVideoSrc}-${trackedVehicle?.licensePlate || selectedShowcaseVehicle}`}
            src={currentVideoSrc}
            poster={currentPoster}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover transition-opacity duration-700"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={currentPoster}
              alt="Proceso de lavado y detallado Exclusive"
              fill
              className="object-cover scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
              priority
            />
          </div>
        )}

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/60 pointer-events-none" />

        {/* TOP OVERLAY */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto z-20">
          {/*
            [OVERLAY CÁMARA REC CCTV - TEMPORALMENTE COMENTADO]
            {trackedVehicle && (
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 backdrop-blur-md flex items-center gap-1.5 text-[10px] font-mono text-white">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-red-400">REC</span>
                  <span>{trackedVehicle.licensePlate}</span>
                </div>
              </div>
            )}
          */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="px-2.5 py-1 rounded-lg bg-black/80 border border-cyan-500/30 backdrop-blur-md flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-cyan-300 shadow-lg shrink-0">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>SHOWROOM STUDIO</span>
            </div>

            <div className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-black/65 border border-white/15 text-[10px] font-semibold text-slate-200 truncate">
              {activeShowcase.badge}
            </div>
          </div>

          {/* Toggle between Video and Photo mode */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-black/85 border border-white/20 backdrop-blur-md shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("video")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "video"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Ver video demostrativo"
            >
              <Video className="w-3 h-3" />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("photo")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === "photo"
                  ? "bg-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Ver fotografía de estudio en HD"
            >
              <Camera className="w-3 h-3" />
              <span>Foto HD</span>
            </button>
          </div>
        </div>

        {/* BOTTOM OVERLAY (Process description & playback controls) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2.5 z-20 pointer-events-auto">
          <div className="p-2 sm:px-3 sm:py-2 rounded-xl bg-black/85 border border-white/15 backdrop-blur-md flex items-center gap-2 text-xs text-white min-w-0 max-w-[78%]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-white text-[11px] leading-tight truncate">
                {trackedVehicle ? (
                  <>
                    Vehículo: <span className="text-cyan-300 font-mono">{trackedVehicle.licensePlate}</span> •{" "}
                    {trackedVehicle.serviceName || "Lavado & Detailing"}
                  </>
                ) : (
                  activeShowcase.title
                )}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {trackedVehicle ? (
                  <>
                    Paso actual: <span className="text-emerald-400 font-semibold">{trackedVehicle.stageName}</span> (Etapa{" "}
                    {trackedVehicle.stage} de 5)
                  </>
                ) : (
                  activeShowcase.subtitle
                )}
              </p>
            </div>
          </div>

          {/* Video Control Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg bg-black/75 border border-white/20 text-white hover:text-cyan-400 hover:border-cyan-400/50 flex items-center justify-center transition-all backdrop-blur-md cursor-pointer"
              title={isPlaying ? "Pausar video" : "Reanudar video"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="w-8 h-8 rounded-lg bg-black/75 border border-white/20 text-white hover:text-cyan-400 hover:border-cyan-400/50 flex items-center justify-center transition-all backdrop-blur-md cursor-pointer"
              title={isMuted ? "Activar audio" : "Silenciar audio"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. WORKSHOP TELEMETRY STRIP (Clean 2x2 layout without text clipping) */}
      <div className="relative z-10 grid grid-cols-2 gap-2.5">
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Champú Técnico
            </span>
            <span className="text-xs font-black text-white block truncate mt-0.5">
              Snow Foam pH 7.0
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Presión de Agua
            </span>
            <span className="text-xs font-black text-white block truncate mt-0.5">
              180 Bar Purificada
            </span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Seguridad Pintura
            </span>
            <span className="text-xs font-black text-white block truncate mt-0.5">
              100% Cero Rayones
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleScrollToBooking}
          className="p-2.5 sm:p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-between gap-2 text-cyan-300 hover:text-white transition-all group/btn cursor-pointer"
        >
          <div className="text-left min-w-0">
            <span className="text-[10px] uppercase font-bold text-cyan-400/80 block leading-tight">
              Turno Express
            </span>
            <span className="text-xs font-black uppercase tracking-wider block truncate mt-0.5">
              Agendar Cita
            </span>
          </div>
          <Calendar className="w-4 h-4 shrink-0 text-cyan-400 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4. PREMIUM PRODUCTS USED IN BAY (Click any product to open detailed modal) */}
      <div className="relative z-10 rounded-2xl bg-slate-950/70 border border-white/10 p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-white truncate">
              Productos Premium Aplicados en tu Lavado
            </span>
          </div>
          <button
            type="button"
            onClick={handleScrollToProducts}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 shrink-0 cursor-pointer"
          >
            <span>Ver todos ({bayProducts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {featuredBayProducts.map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => onSelectProduct && onSelectProduct(prod)}
              className="group/prod flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/40 transition-all text-left min-w-0 cursor-pointer"
            >
              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                <Image
                  src={prod.image}
                  alt={prod.shortName}
                  fill
                  unoptimized={prod.image.startsWith("data:") || prod.image.startsWith("http")}
                  className="object-cover group-hover/prod:scale-110 transition-transform duration-300"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white group-hover/prod:text-cyan-300 truncate leading-tight">
                  {prod.shortName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {prod.categoryLabel}
                </p>
                <div className="flex items-center justify-between gap-1 mt-0.5">
                  <span className="text-[11px] font-black text-cyan-400">
                    {formatCurrency(prod.price)}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 group-hover/prod:text-white flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" /> Ver
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. CUSTOMER LIVE TRACKING CALLOUT */}
      <div className="relative z-10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-cyan-950/45 via-slate-900/70 to-blue-950/35 border border-cyan-500/25 rounded-2xl overflow-hidden">
        <div className="flex items-start sm:items-center gap-2.5 text-xs text-slate-200 min-w-0 flex-1">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed break-words">
            ¿Tienes tu vehículo en nuestras instalaciones? Ingresa tu placa para consultar el avance técnico, bahía asignada y hora de entrega en tiempo real.
          </span>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto shrink-0">
          {onOpenTracker && (
            <button
              type="button"
              onClick={onOpenTracker}
              className="w-full xl:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/35 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Rastrear mi Vehículo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
