import mongoose, { Schema, Model } from "mongoose";

export interface IEmployee {
  name: string;
  active: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
