import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import Expense from "@/models/Expense";

// GET /api/expenses
export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: false,
        fallback: true,
        expenses: [],
      });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({ success: false, fallback: true, expenses: [] });
    }

    const expenses = await Expense.find().sort({ createdAt: -1 }).lean();

    const formatted = expenses.map((e: any) => ({
      id: e._id.toString(),
      description: e.description,
      category: e.category,
      amount: e.amount,
      date: e.date,
      time: e.time,
      notes: e.notes || "",
    }));

    return NextResponse.json({
      success: true,
      fallback: false,
      count: formatted.length,
      expenses: formatted,
    });
  } catch (error: any) {
    console.error("API GET /api/expenses error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message, expenses: [] },
      { status: 500 }
    );
  }
}

// POST /api/expenses
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: false, fallback: true });
    }

    await connectToDatabase();

    const newExpense: any = await Expense.create({
      description: data.description,
      category: data.category || "otro",
      amount: Number(data.amount) || 0,
      date: data.date || "Hoy",
      time: data.time || "10:00 AM",
      notes: data.notes || "",
    });

    return NextResponse.json({
      success: true,
      expense: {
        id: newExpense._id.toString(),
        description: newExpense.description,
        category: newExpense.category,
        amount: newExpense.amount,
        date: newExpense.date,
        time: newExpense.time,
        notes: newExpense.notes,
      },
    });
  } catch (error: any) {
    console.error("API POST /api/expenses error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses - Delete a single specific expense by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: false, fallback: true });
    }

    await connectToDatabase();

    if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
      await Expense.deleteOne({ _id: id });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API DELETE /api/expenses error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message },
      { status: 500 }
    );
  }
}
