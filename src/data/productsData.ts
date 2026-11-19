export interface DetailingProduct {
  id: string;
  name: string;
  shortName: string;
  brandLine: string;
  category: "exterior" | "proteccion" | "rines-motor" | "interior";
  categoryLabel: string;
  badge: string;
  price: number;
  presentation: string;
  techSpec: string;
  phLevel: string;
  protectionDuration: string;
  image: string;
  summary: string;
  description: string;
  howWeUseIt: string;
  benefits: string[];
  applicationAreas: string[];
  includedInServices: string[];
}

export const PREMIUM_PRODUCTS: DetailingProduct[] = [
  {
    id: "shampoo-snow-foam",
    name: "Champú Técnico Snow Foam pH 7.0 Neutro",
    shortName: "Snow Foam pH 7.0",
    brandLine: "Exclusive Detailing Lab • Serie PureWash",
    category: "exterior",
    categoryLabel: "Pre-Lavado & Champú",
    badge: "Uso en Todas las Bahías",
    price: 68000,
    presentation: "Botella 1000 ml (Alta Concentración)",
    techSpec: "Dilución 1:10 en Cañón de Espuma",
    phLevel: "pH 7.0 Neutro Certificado",
    protectionDuration: "Respeta ceras y cerámicos previos",
    image: "/images/products/shampoo-snow-foam.jpg",
    summary:
      "Espuma hiperdensa de lubricación extrema que encapsula el barro y polvo vial sin fricción para evitar microrrayones (swirls).",
    description:
      "Formulado con tensioactivos biodegradables de última generación y polímeros de alta lubricidad. A diferencia de los detergentes alcalinos convencionales que resecan empaques y opacan la pintura, nuestro Snow Foam pH 7.0 disuelve la suciedad orgánica e inorgánica manteniendo intactas las capas de cera o recubrimiento cerámico.",
    howWeUseIt:
      "Lo proyectamos con cañón espumador a 180 Bar cubriendo todo el vehículo durante 5 minutos antes de cualquier contacto físico, permitiendo que los contaminantes caigan por gravedad.",
    benefits: [
      "100% libre de sosa cáustica, siliconas pesadas y fosfatos",
      "Máxima lubricación para guante de lana merino y microfibra",
      "No mancha molduras negras, cromados ni aluminio anodizado",
      "Potenciador óptico de brillo desde el primer enjuague",
    ],
    applicationAreas: [
      "Pintura bicapa y tricapa",
      "Pinturas mate y PPF (Paint Protection Film)",
      "Carenajes y tanques de motocicletas",
      "Vidrios y ópticas LED/ policarbonato",
    ],
    includedInServices: [
      "Lavado Básico Express",
      "Lavado Full Detailing",
      "Lavado + Encerado & Polichado Cerámico",
    ],
  },
  {
    id: "cera-carnauba-sio2",
    name: "Cera Híbrida Carnauba T1 & SiO2 Mirror Wax",
    shortName: "Cera Carnauba + SiO2",
    brandLine: "Exclusive Detailing Lab • Serie MirrorGloss",
    category: "proteccion",
    categoryLabel: "Ceras & Brillo",
    badge: "Acabado Espejo Profundo",
    price: 125000,
    presentation: "Tarro Anodizado 300 g + Aplicador",
    techSpec: "35% Carnauba Brasileña + Dióxido de Silicio",
    phLevel: "Fórmula Libre de Abrasivos",
    protectionDuration: "Hasta 90 días de repelencia activa",
    image: "/images/products/cera-carnauba-sio2.jpg",
    summary:
      "Fusión de cera natural de Carnauba grado T1 con nanopartículas cerámicas SiO2 para un brillo cálido, húmedo y ultra hidrofóbico.",
    description:
      "Combina la profundidad óptica inigualable de la carnauba amarilla pura de Brasil con la resistencia térmica y química del dióxido de silicio (SiO2). Rellena micro-imperfecciones ópticas de la laca y crea un escudo resbaladizo al tacto que repele lluvia ácida, savia de árboles y rayos UV.",
    howWeUseIt:
      "Se aplica manualmente o con polichadora orbital de doble acción (DA) con pomo de espuma ultra suave tras el descontaminado de la pintura, retirando con microfibra de 600 GSM.",
    benefits: [
      "Efecto 'Wet Look' (brillo húmedo profundo) en tonos oscuros y claros",
      "Ángulo de contacto de gota superior a 110° (alto beading)",
      "Filtro solar UV400 contra el amarillamiento de la laca",
      "Facilita los futuros lavados al evitar que el barro se adhiera",
    ],
    applicationAreas: [
      "Carrocería exterior de autos y camionetas",
      "Tanques y tapas laterales de motocicletas",
      "Rines pintados en negro piano o diamantados",
      "Acabados en fibra de carbono real",
    ],
    includedInServices: ["Lavado + Encerado & Polichado Cerámico"],
  },
  {
    id: "sellador-ceramico",
    name: "Sellador Cerámico Hidrofóbico SiO2 9H Booster",
    shortName: "Sellador Cerámico SiO2",
    brandLine: "Exclusive Detailing Lab • Serie NanoShield",
    category: "proteccion",
    categoryLabel: "Sellado Cerámico",
    badge: "Efecto Hidrofóbico Extremo",
    price: 98000,
    presentation: "Spray Aluminio 500 ml",
    techSpec: "Polímeros de Cuarzo Líquido SiO2 + TiO2",
    phLevel: "pH 6.8 Neutro",
    protectionDuration: "3 a 4 meses por aplicación",
    image: "/images/products/sellador-ceramico.jpg",
    summary:
      "Sellador en spray de enlace molecular instantáneo que encapsula la pintura con una película cristalina repelente al agua y al polvo.",
    description:
      "Diseñado para crear una barrera reticulada de cuarzo líquido en minutos. Su alta concentración de SiO2 y dióxido de titanio (TiO2) incrementa la tensión superficial de la pintura, haciendo que el agua y el lodo resbalen instantáneamente sin dejar marcas de gota seca (water spots).",
    howWeUseIt:
      "Lo aplicamos en la Fase 04 de nuestro protocolo técnico justo antes del secado por turbina de aire caliente para sellar poros de pintura, vidrios y rines.",
    benefits: [
      "Escudo hidrofóbico instantáneo con efecto autolimpiante",
      "Aporta tacto de seda ultra deslizante en toda la carrocería",
      "Protege contra excremento de aves, insectos y salitre",
      "Seguro sobre vidrios exteriores para mejorar visibilidad en lluvia",
    ],
    applicationAreas: [
      "Pintura automotriz y barniz transparente",
      "Parabrisas y vidrios laterales exteriores",
      "Cúpulas de motos y visores de cascos",
      "Cromados y emblemas metálicos",
    ],
    includedInServices: [
      "Lavado Full Detailing",
      "Lavado + Encerado & Polichado Cerámico",
    ],
  },
  {
    id: "descontaminante-ferrico",
    name: "Descontaminante Férrico de Rines & Calipers",
    shortName: "Iron Fallout Rines",
    brandLine: "Exclusive Detailing Lab • Serie WheelPro",
    category: "rines-motor",
    categoryLabel: "Rines & Frenos",
    badge: "Reacción Violeta Activa",
    price: 74000,
    presentation: "Atomizador Pro 750 ml",
    techSpec: "Quelante de Hierro sin Ácido Fluorhídrico",
    phLevel: "pH 7.2 Balanceado",
    protectionDuration: "Limpieza profunda sin corrosión",
    image: "/images/products/descontaminante-ferrico.jpg",
    summary:
      "Disuelve químicamente el polvillo metálico incrustado de las pastillas de freno cambiando a color púrpura sin dañar rines ni mordazas.",
    description:
      "Al frenar, los discos y pastillas liberan micropartículas de hierro incandescente que se clavan en el barniz de los rines y la pintura. Este gel reactivo pH neutro reacciona únicamente con el óxido ferroso (tornándose violeta intenso) para extraerlo de raíz sin usar ácidos agresivos.",
    howWeUseIt:
      "Se pulveriza en frío sobre rines, calipers y discos en la Fase 01, dejándolo reaccionar de 2 a 3 minutos antes de detallar con cepillos de microfibra suave.",
    benefits: [
      "Indicador visual de cambio de color (transparente a púrpura)",
      "Totalmente seguro en rines diamantados, cromados y anodizados",
      "No oxida tornillería, discos de freno ni sensores ABS",
      "Remueve contaminación férrica antes del polichado",
    ],
    applicationAreas: [
      "Rines de lujo, aluminio forjado y magnesio",
      "Mordazas (calipers) pintadas o deportivas",
      "Rines de radios y aspas de motocicletas",
      "Bajos de carrocería con contaminación industrial",
    ],
    includedInServices: [
      "Lavado Full Detailing",
      "Lavado + Encerado & Polichado Cerámico",
      "Especial Moto: Cadena + Detailing Motor",
    ],
  },
  {
    id: "hidratador-interior",
    name: "Acondicionador Interior UV Cuero & Cockpit",
    shortName: "Hidratador Interior UV",
    brandLine: "Exclusive Detailing Lab • Serie CabinLux",
    category: "interior",
    categoryLabel: "Interior & Cojinería",
    badge: "Acabado Satinado Original",
    price: 62000,
    presentation: "Dispensador 500 ml",
    techSpec: "Base Agua con Polímeros UV & Vitamina E",
    phLevel: "pH 7.0 Hipoalergénico",
    protectionDuration: "Hasta 60 días anti-estática",
    image: "/images/products/hidratador-interior.jpg",
    summary:
      "Nutre y restaura tableros, carteras y asientos de cuero devolviendo el tono mate-satinado de fábrica sin sensación grasosa.",
    description:
      "A diferencia de las siliconas comerciales que dejan el volante resbaloso, atraen polvo y cuartean el millaré con el sol, nuestra emulsión a base de agua penetra los poros del vinilo, polímeros blandos y cuero automotriz, bloqueando la radiación UV y dejando un acabado seco al tacto.",
    howWeUseIt:
      "Lo aplicamos con pomo de microfibra tras la limpieza y vaporización de ductos y cabina, nutriendo cada moldura, consola central y empaque de puerta.",
    benefits: [
      "Acabado 100% seco al tacto: cero brillo grasoso ni reflejos en el parabrisas",
      "Propiedad antiestática que repele la pelusa y el polvo en cabina",
      "Previene el agrietamiento y decoloración por sol intenso",
      "Aroma sutil a vehículo nuevo de alta gama",
    ],
    applicationAreas: [
      "Tablero (millaré), consolas y paneles de puerta",
      "Sillas de cuero natural, alcántara y vinilcuero",
      "Sillines de motocicleta (no deja superficie resbalosa)",
      "Empaques de caucho y plásticos exteriores negros",
    ],
    includedInServices: [
      "Lavado Full Detailing",
      "Lavado de Cojinería & Desinfección",
    ],
  },
  {
    id: "kit-moto-motor",
    name: "Desengrasante Dieléctrico & Lube Sintético Pro",
    shortName: "Kit Motor & Cadena",
    brandLine: "Exclusive Detailing Lab • Serie TechMechanics",
    category: "rines-motor",
    categoryLabel: "Motor & Motos",
    badge: "Seguro para Electrónica",
    price: 89000,
    presentation: "Dúo Técnico 600 ml + Spray 400 ml",
    techSpec: "Solvente Citpeno Biodegradable + PTFE Cerámico",
    phLevel: "No Conductivo / Dieléctrico",
    protectionDuration: "600 km en cadena / 60 días en motor",
    image: "/images/products/kit-moto-motor.jpg",
    summary:
      "Fórmula dieléctrica que disuelve grasa pesada en motores y kits de arrastre sin afectar sensores, acompañada de lubricante anti-salpicadura.",
    description:
      "Desarrollado para bahías de motores modernos llenos de módulos electrónicos y motocicletas de alto cilindraje. El desengrasante disuelve aceite quemado sin resecar mangueras ni sulfatar conectores, mientras el lubricante sintético con PTFE se adhiere a los eslabones sin salpicar el rin trasero.",
    howWeUseIt:
      "Lo utilizamos en el servicio de Desengrasada de Motor y Especial Moto junto con vapor controlado a 120°C y cepillos técnicos de precisión.",
    benefits: [
      "Seguridad dieléctrica: no genera cortos ni sulfata sensores",
      "Compatible con retenedores O-Ring, X-Ring y Z-Ring en motos",
      "Lubricación seca con polímeros cerámicos que no atrapa arena",
      "Restaura el aspecto original de bloques de aluminio y mangueras",
    ],
    applicationAreas: [
      "Bahía de motor de automóviles y camionetas",
      "Kit de arrastre (cadena, corona y piñón) de motocicletas",
      "Tijera trasera, cárter y bloques de motor expuestos",
      "Bisagras y mecanismos mecánicos",
    ],
    includedInServices: [
      "Desengrasada & Protección de Motor",
      "Especial Moto: Cadena + Detailing Motor",
    ],
  },
];

const STORAGE_KEY_PRODUCTS = "exclusive_custom_products_v1";
export const PRODUCTS_UPDATED_EVENT = "exclusive-products-updated";

export const PRODUCT_CATEGORY_LABELS: Record<DetailingProduct["category"], string> = {
  exterior: "Pre-Lavado & Champú",
  proteccion: "Ceras & Sellado Cerámico",
  "rines-motor": "Rines, Motor & Motos",
  interior: "Interior & Cuero UV",
};

export function getStoredProducts(): DetailingProduct[] {
  if (typeof window === "undefined") return PREMIUM_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(PREMIUM_PRODUCTS));
      return PREMIUM_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return PREMIUM_PRODUCTS;
    }
    return parsed;
  } catch {
    return PREMIUM_PRODUCTS;
  }
}

export function saveOrUpdateProduct(product: DetailingProduct): DetailingProduct[] {
  const current = getStoredProducts();
  const existsIdx = current.findIndex((p) => p.id === product.id);
  let updated: DetailingProduct[];

  if (existsIdx >= 0) {
    updated = [...current];
    updated[existsIdx] = product;
  } else {
    updated = [product, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    }).catch(() => {});
  }

  return updated;
}

export function deleteStoredProduct(productId: string): DetailingProduct[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== productId);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
    fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: "DELETE",
    }).catch(() => {});
  }

  return updated;
}

export function resetDefaultProducts(): DetailingProduct[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(PREMIUM_PRODUCTS));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
  }
  return PREMIUM_PRODUCTS;
}

export async function syncProductsWithBackend(): Promise<DetailingProduct[]> {
  try {
    const res = await fetch("/api/products");
    const data = await res.json();
    if (typeof window !== "undefined" && typeof data?.sectionEnabled === "boolean") {
      localStorage.setItem(
        "exclusive_products_section_enabled",
        data.sectionEnabled ? "true" : "false"
      );
      window.dispatchEvent(new Event("exclusive_products_visibility_changed"));
    }
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(data.products));
        window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
      }
      return data.products;
    }
    return getStoredProducts();
  } catch {
    return getStoredProducts();
  }
}


