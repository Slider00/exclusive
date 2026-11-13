import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense {
  description: string;
  category: "insumos" | "servicios" | "nomina" | "mantenimiento" | "otro";
  amount: number;
  date: string;
  time: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["insumos", "servicios", "nomina", "mantenimiento", "otro"],
      default: "otro",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      default: "Hoy",
    },
    time: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
