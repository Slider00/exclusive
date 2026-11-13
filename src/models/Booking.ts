import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking {
  code: string;
  licensePlate: string;
  vehicleType: "carro" | "camioneta" | "moto";
  serviceId: string;
  serviceName: string;
  originalPrice?: number;
  discountPercent?: number;
  promoCode?: string;
  price: number;
  day: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  isWalkIn: boolean;
  bay: string;
  stage: 1 | 2 | 3 | 4 | 5;
  stageName: string;
  paymentMethod: "efectivo" | "nequi" | "daviplata" | "tarjeta" | "pendiente";
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    licensePlate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: ["carro", "camioneta", "moto"],
      default: "carro",
      required: true,
    },
    serviceId: {
      type: String,
      required: true,
      default: "lavado-full",
    },
    serviceName: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    promoCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    day: {
      type: String,
      required: true,
      default: "Hoy",
    },
    time: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    clientNotes: {
      type: String,
      default: "",
    },
    isWalkIn: {
      type: Boolean,
      default: false,
    },
    bay: {
      type: String,
      default: "Bahía 1 (Lavado)",
    },
    stage: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 1,
    },
    stageName: {
      type: String,
      default: "En Espera / Recepción",
    },
    paymentMethod: {
      type: String,
      enum: ["efectivo", "nequi", "daviplata", "tarjeta", "pendiente"],
      default: "pendiente",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite in Next.js development
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
