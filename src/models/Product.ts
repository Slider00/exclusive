import mongoose, { Schema, Model } from "mongoose";
import { DetailingProduct } from "@/data/productsData";

const ProductSchema = new Schema<DetailingProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
    },
    brandLine: {
      type: String,
      default: "Exclusive Detailing Lab",
    },
    category: {
      type: String,
      enum: ["exterior", "proteccion", "rines-motor", "interior"],
      default: "exterior",
    },
    categoryLabel: {
      type: String,
      default: "Pre-Lavado & Champú",
    },
    badge: {
      type: String,
      default: "Insumo Oficial de Bahía",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    presentation: {
      type: String,
      default: "Botella 500 ml",
    },
    techSpec: {
      type: String,
      default: "Fórmula Profesional",
    },
    phLevel: {
      type: String,
      default: "pH 7.0 Neutro",
    },
    protectionDuration: {
      type: String,
      default: "Protección Prolongada",
    },
    image: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    howWeUseIt: {
      type: String,
      default: "",
    },
    benefits: {
      type: [String],
      default: [],
    },
    applicationAreas: {
      type: [String],
      default: [],
    },
    includedInServices: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<DetailingProduct> =
  mongoose.models.Product || mongoose.model<DetailingProduct>("Product", ProductSchema);

export default Product;

