"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  DetailingProduct,
  PRODUCT_CATEGORY_LABELS,
  saveOrUpdateProduct,
} from "@/data/productsData";
import { SERVICES_LIST, formatCurrency } from "@/data/servicesData";
import {
  X,
  Upload,
  FlaskConical,
  DollarSign,
  Sparkles,
  Check,
  Image as ImageIcon,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: DetailingProduct | null;
  onSaved: (updatedList: DetailingProduct[]) => void;
}

const PRESET_IMAGES = [
  { label: "Snow Foam pH 7.0", url: "/images/products/shampoo-snow-foam.jpg" },
  { label: "Cera Carnauba SiO2", url: "/images/products/cera-carnauba-sio2.jpg" },
  { label: "Sellador Cerámico", url: "/images/products/sellador-ceramico.jpg" },
  { label: "Descontaminante Rines", url: "/images/products/descontaminante-ferrico.jpg" },
  { label: "Hidratador Interior", url: "/images/products/hidratador-interior.jpg" },
  { label: "Kit Motor & Cadena", url: "/images/products/kit-moto-motor.jpg" },
];

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSaved,
}: ProductFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [brandLine, setBrandLine] = useState("Exclusive Detailing Lab • Serie Pro");
  const [category, setCategory] = useState<DetailingProduct["category"]>("exterior");
  const [badge, setBadge] = useState("Insumo Oficial de Bahía");
  const [price, setPrice] = useState<string>("65000");
  const [presentation, setPresentation] = useState("Botella 1000 ml");
  const [phLevel, setPhLevel] = useState("pH 7.0 Neutro");
  const [techSpec, setTechSpec] = useState("Fórmula Biodegradable de Alta Lubricación");
  const [protectionDuration, setProtectionDuration] = useState("Hasta 60 días de protección");
  const [image, setImage] = useState("/images/products/shampoo-snow-foam.jpg");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [howWeUseIt, setHowWeUseIt] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [areasText, setAreasText] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Lavado Full Detailing",
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingProduct) {
      setName(editingProduct.name);
      setShortName(editingProduct.shortName);
      setBrandLine(editingProduct.brandLine || "Exclusive Detailing Lab • Serie Pro");
      setCategory(editingProduct.category);
      setBadge(editingProduct.badge);
      setPrice(String(editingProduct.price));
      setPresentation(editingProduct.presentation);
      setPhLevel(editingProduct.phLevel);
      setTechSpec(editingProduct.techSpec);
      setProtectionDuration(editingProduct.protectionDuration);
      setImage(editingProduct.image);
      setSummary(editingProduct.summary);
      setDescription(editingProduct.description);
      setHowWeUseIt(editingProduct.howWeUseIt);
      setBenefitsText((editingProduct.benefits || []).join("\n"));
      setAreasText((editingProduct.applicationAreas || []).join("\n"));
      setSelectedServices(editingProduct.includedInServices || []);
    } else {
      setName("");
      setShortName("");
      setBrandLine("Exclusive Detailing Lab • Serie Pro");
      setCategory("exterior");
      setBadge("Insumo Oficial de Bahía");
      setPrice("68000");
      setPresentation("Botella 500 ml");
      setPhLevel("pH 7.0 Neutro");
      setTechSpec("Polímeros Sintéticos de Alto Brillo");
      setProtectionDuration("Protección prolongada por 60 días");
      setImage("/images/products/shampoo-snow-foam.jpg");
      setSummary("");
      setDescription("");
      setHowWeUseIt(
        "Se aplica en bahía con microfibra de alto gramaje o cañón espumador garantizando cero contacto abrasivo."
      );
      setBenefitsText(
        "100% seguro para pinturas bicapa, mate y PPF\nRealza el brillo profundo sin dejar residuos grasos\nFórmula biodegradable de grado profesional"
      );
      setAreasText(
        "Carrocería exterior de autos y camionetas\nCarenajes y tanques de motocicletas\nRines y acabados brillantes"
      );
      setSelectedServices(["Lavado Full Detailing"]);
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  // Compress uploaded photo on client so it saves fast in localStorage & MongoDB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.84);
          setImage(dataUrl);
        }
        setUploadingImage(false);
      };
      img.onerror = () => setUploadingImage(false);
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanShort =
      shortName.trim() || name.trim().split(" ").slice(0, 3).join(" ");

    const benefits = benefitsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const applicationAreas = areasText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const productPayload: DetailingProduct = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      shortName: cleanShort,
      brandLine: brandLine.trim() || "Exclusive Detailing Lab",
      category,
      categoryLabel: PRODUCT_CATEGORY_LABELS[category],
      badge: badge.trim() || "Insumo Oficial",
      price: Math.max(0, Number(price.replace(/\D/g, "")) || 0),
      presentation: presentation.trim() || "Botella 500 ml",
      techSpec: techSpec.trim() || "Fórmula Profesional",
      phLevel: phLevel.trim() || "pH 7.0 Neutro",
      protectionDuration: protectionDuration.trim() || "Protección Activa",
      image: image.trim() || "/images/products/shampoo-snow-foam.jpg",
      summary:
        summary.trim() ||
        description.trim().slice(0, 140) ||
        "Insumo profesional de detallado automotriz aplicado en nuestras bahías.",
      description:
        description.trim() ||
        summary.trim() ||
        "Producto químico de alto desempeño diseñado para proteger y embellecer tu vehículo sin deteriorar superficies delicadas.",
      howWeUseIt:
        howWeUseIt.trim() ||
        "Aplicado por nuestros técnicos especialistas siguiendo el protocolo de 4 fases libre de microrrayones.",
      benefits:
        benefits.length > 0
          ? benefits
          : ["Fórmula segura de grado profesional", "Acabado de alto brillo y protección"],
      applicationAreas:
        applicationAreas.length > 0
          ? applicationAreas
          : ["Pintura automotriz", "Motocicletas", "Camionetas SUV"],
      includedInServices:
        selectedServices.length > 0 ? selectedServices : ["Lavado Full Detailing"],
    };

    const updatedList = saveOrUpdateProduct(productPayload);
    onSaved(updatedList);
    onClose();
  };

  const isCustomImg = image.startsWith("data:") || image.startsWith("http");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {editingProduct ? "Editar Producto Premium" : "Crear Nuevo Producto Premium"}
              </h3>
              <p className="text-xs text-slate-400">
                Sube la foto real desde tu equipo o celular, ajusta su precio y ficha técnica sin tocar código.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Image Upload & Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <label className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Fotografía del Producto</span>
              </label>

              {/* Image Preview Box */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-white/15 shadow-inner group">
                <Image
                  src={image}
                  alt={name || "Vista previa"}
                  fill
                  unoptimized={isCustomImg}
                  className="object-cover"
                  sizes="360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 truncate">
                    {shortName || name || "Vista Previa"}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-black shrink-0">
                    {formatCurrency(Number(price.replace(/\D/g, "")) || 0)}
                  </span>
                </div>
              </div>

              {/* Upload Real Photo Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/35 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>
                  {uploadingImage
                    ? "Procesando imagen..."
                    : "Subir Foto Real desde tu Equipo / Celular"}
                </span>
              </button>

              {/* Or Pick Studio AI Preset */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  O elegir imagen de estudio con IA:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`p-1.5 rounded-lg border text-[10px] font-semibold truncate transition-all cursor-pointer ${
                        image === preset.url
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Product Details & Pricing (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Nombre Completo del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Champú Técnico Snow Foam pH 7.0 Neutro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Nombre Corto (Cámara en Vivo)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Snow Foam pH 7.0"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-cyan-300 block mb-1">
                    Precio en Pesos (COP) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      placeholder="68000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-white font-black text-xs sm:text-sm focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as DetailingProduct["category"])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="exterior">Champú & Pre-Lavado</option>
                    <option value="proteccion">Ceras & Sellado Cerámico</option>
                    <option value="rines-motor">Rines, Motor & Motos</option>
                    <option value="interior">Cabina & Cuero UV</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Presentación / Tamaño
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Botella 1000 ml / Tarro 300 g"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Balance Químico / pH
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: pH 7.0 Neutro Certificado"
                    value={phLevel}
                    onChange={(e) => setPhLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Insignia Destacada (Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Acabado Espejo Profundo"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Fórmula / Especificación Técnica
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 35% Carnauba + Dióxido de Silicio SiO2"
                    value={techSpec}
                    onChange={(e) => setTechSpec(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Duración / Rendimiento
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Hasta 90 días de repelencia activa"
                    value={protectionDuration}
                    onChange={(e) => setProtectionDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Summary & Detailed Description */}
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                  Resumen Corto (Se ve en la tarjeta) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe en 1 o 2 frases qué hace especial a este producto..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                  Descripción Técnica Completa (Se ve al abrir el Modal)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explicación detallada de sus componentes, seguridad sobre la pintura y resultados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                  ¿Cómo lo aplicamos en las bahías de lavado?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Lo proyectamos con cañón espumador a 180 Bar dejando actuar 5 minutos..."
                  value={howWeUseIt}
                  onChange={(e) => setHowWeUseIt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Benefits & Surfaces */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Beneficios Técnicos (1 por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={benefitsText}
                    onChange={(e) => setBenefitsText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1">
                    Superficies Compatibles (1 por línea)
                  </label>
                  <textarea
                    rows={3}
                    value={areasText}
                    onChange={(e) => setAreasText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Included in Services Checkboxes */}
              <div>
                <label className="text-[11px] uppercase font-bold text-slate-300 block mb-1.5">
                  Servicios donde se utiliza este insumo:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICES_LIST.map((srv) => {
                    const active = selectedServices.includes(srv.name);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => toggleService(srv.name)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          active
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                            : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {active && <Check className="w-3 h-3 text-cyan-400" />}
                        <span>{srv.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{editingProduct ? "Guardar Cambios" : "Publicar Producto en la Web"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

