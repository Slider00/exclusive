export type VehicleType = "carro" | "camioneta" | "moto";

export interface ServiceItem {
  id: string;
  name: string;
  category: "carro" | "camioneta" | "moto" | "todos";
  tagline: string;
  description: string;
  durationMinutes: number;
  prices: {
    carro: number;
    camioneta: number;
    moto: number;
  };
  features: string[];
  isPopular?: boolean;
  isPremium?: boolean;
}

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: "lavada-sencilla",
    name: "Lavado Básico",
    category: "todos",
    tagline: "Limpieza exterior rápida, cuidadosa y efectiva para tu vehículo",
    description: "Espuma activa pH neutro, lavado manual con microfibra anti-rayones, secado con aire y abrillantador protector de llantas. (Motos Bajo Cilindraje: $25.000 | Alto Cilindraje: $30.000)",
    durationMinutes: 30,
    prices: {
      carro: 30000,
      camioneta: 45000,
      moto: 25000,
    },
    features: [
      "Espumado con shampoo Snow Foam pH neutro",
      "Lavado manual suave anti-rayones",
      "Secado con toalla de microfibra y aire a presión",
      "Hidratación y brillo protector en llantas",
      "Limpieza de vidrios exteriores",
    ],
  },
  {
    id: "lavada-full",
    name: "Lavado Full",
    category: "todos",
    tagline: "El servicio más solicitado: limpieza profunda interior y exterior",
    description: "Lavado exterior completo con espuma activa, aspirado minucioso de interior, hidratación de plásticos/tablero y aromatización premium. (Motos Bajo Cilindraje: $35.000 | Alto Cilindraje: $40.000)",
    durationMinutes: 50,
    prices: {
      carro: 40000,
      camioneta: 55000,
      moto: 35000,
    },
    isPopular: true,
    features: [
      "Todo lo incluido en el Lavado Básico",
      "Aspirado profundo de piso, cojinería y baúl",
      "Limpieza e hidratación de tablero, puertas y consola",
      "Limpieza interior y exterior de vidrios",
      "Aromatizante exclusivo de larga duración",
    ],
  },
  {
    id: "lavado-express-motor",
    name: "Lavado Express (Lavado Full + Motor)",
    category: "todos",
    tagline: "Combo integral: Lavado Full + Desengrasado y protección de motor",
    description: "Servicio completo interior y exterior sumado a la limpieza técnica del compartimiento del motor con desengrasante dieléctrico e hidratación de partes plásticas.",
    durationMinutes: 75,
    prices: {
      carro: 75000,
      camioneta: 75000,
      moto: 0,
    },
    isPremium: true,
    features: [
      "Incluye Lavado Full completo (Interior + Exterior)",
      "Lavado técnico de motor con producto dieléctrico seguro",
      "Protección de componentes electrónicos y sensores",
      "Secado con aire a presión e hidratación de mangueras y plásticos",
      "Acabado de exposición bajo el capó",
    ],
  },
  {
    id: "moto-alto-basico",
    name: "Lavado Básico — Moto Alto Cilindraje",
    category: "moto",
    tagline: "Cuidado especializado para motocicletas de alto cilindraje",
    description: "Lavado detallado con espuma pH neutro sin contacto agresivo, secado por turbina de aire y cuidado especial de carenajes, rines y partes cromadas.",
    durationMinutes: 35,
    prices: {
      carro: 0,
      camioneta: 0,
      moto: 30000,
    },
    features: [
      "Espuma activa pH neutro segura para carenajes y pintura",
      "Lavado detallado de rines, tijera y mordazas",
      "Secado sin contacto con soplador térmico",
      "Brillo en llantas sin afectar la banda de rodadura",
    ],
  },
  {
    id: "moto-alto-full",
    name: "Lavado Full — Moto Alto Cilindraje",
    category: "moto",
    tagline: "Spa completo y detallado profundo para motos de alto cilindraje",
    description: "Limpieza minuciosa de motor, desengrasado técnico de kit de arrastre, hidratación de plásticos negros, partes mate/brillantes y protección UV.",
    durationMinutes: 55,
    prices: {
      carro: 0,
      camioneta: 0,
      moto: 40000,
    },
    isPopular: true,
    features: [
      "Todo lo incluido en el Lavado Básico de Alto Cilindraje",
      "Desengrasado profundo de motor, rines y kit de arrastre",
      "Hidratación UV de plásticos negros, comandos y sillín",
      "Realce de brillo en pintura, tanque y cúpula",
      "Acabado exclusivo tipo showroom",
    ],
  },
];

export const TIME_SLOTS = [
  { time: "08:00 AM", available: true },
  { time: "09:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "12:00 PM", available: true },
  { time: "01:30 PM", available: true },
  { time: "02:30 PM", available: true },
  { time: "03:30 PM", available: true },
  { time: "04:30 PM", available: true },
  { time: "05:30 PM", available: true },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Configuración general del negocio y contacto directo por WhatsApp
export const BUSINESS_CONFIG = {
  name: "Exclusive Detallado de Vehículos - Spa de Motos y Autos",
  shortName: "Exclusive Spa de Motos y Autos",
  phone: "+57 323 311 8393",
  // Número oficial de WhatsApp (con código de país 57)
  whatsappNumber: "573233118393",
  address: "Calle 28 #74A-10 Belén Granadas",
  slogan: "Calidad, Rapidez y Estilo",
  openingDate: "21 de Noviembre",
  discountPromo: "15% OFF en cualquiera de las lavadas",
  defaultWhatsAppMessage: "Hola Exclusive Detallado de Vehículos, me gustaría agendar una lavada y reclamar el bono del 15% OFF.",
};
