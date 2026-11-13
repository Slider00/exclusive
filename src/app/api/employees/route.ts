import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { DEFAULT_EMPLOYEES } from "@/data/adminStore";

// GET /api/employees - List active employee names
export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: true,
        fallback: true,
        employees: DEFAULT_EMPLOYEES,
      });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: true,
        fallback: true,
        employees: DEFAULT_EMPLOYEES,
      });
    }

    let employees = await Employee.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();

    // If no employees exist in DB, seed with DEFAULT_EMPLOYEES
    if (!employees || employees.length === 0) {
      const seedDocs = DEFAULT_EMPLOYEES.map((name, index) => ({
        name,
        active: true,
        order: index,
      }));
      await Employee.insertMany(seedDocs, { ordered: false }).catch(() => {});
      employees = await Employee.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
    }

    const names = employees.map((e: any) => e.name);

    return NextResponse.json({
      success: true,
      fallback: false,
      count: names.length,
      employees: names,
    });
  } catch (error: any) {
    console.error("API GET /api/employees error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message, employees: DEFAULT_EMPLOYEES },
      { status: 500 }
    );
  }
}

// POST /api/employees - Add a new employee
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const rawName = data?.name;
    if (!rawName || typeof rawName !== "string" || !rawName.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre del lavador es obligatorio" },
        { status: 400 }
      );
    }

    const name = rawName.trim();

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: true, fallback: true, name });
    }

    await connectToDatabase();

    // Upsert or re-activate if already existed
    const existing = await Employee.findOne({ name });
    if (existing) {
      existing.active = true;
      await existing.save();
    } else {
      const count = await Employee.countDocuments();
      await Employee.create({
        name,
        active: true,
        order: count,
      });
    }

    const activeList = await Employee.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({
      success: true,
      employees: activeList.map((e: any) => e.name),
    });
  } catch (error: any) {
    console.error("API POST /api/employees error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/employees - Remove an employee by name
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const rawName = data?.name || searchParams.get("name");

    if (!rawName || typeof rawName !== "string" || !rawName.trim()) {
      return NextResponse.json(
        { success: false, error: "Nombre no proporcionado" },
        { status: 400 }
      );
    }

    const name = rawName.trim();

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: true, fallback: true, name });
    }

    await connectToDatabase();

    // Delete or mark inactive
    await Employee.deleteOne({ name });

    const activeList = await Employee.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({
      success: true,
      employees: activeList.map((e: any) => e.name),
    });
  } catch (error: any) {
    console.error("API DELETE /api/employees error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/employees - Overwrite entire employee list (sync/reorder/reset)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const rawList: string[] = data?.employees;

    if (!Array.isArray(rawList)) {
      return NextResponse.json(
        { success: false, error: "Lista inválida" },
        { status: 400 }
      );
    }

    const cleaned = Array.from(new Set(rawList.map((e) => String(e).trim()).filter(Boolean)));

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: true, fallback: true, employees: cleaned });
    }

    await connectToDatabase();

    // Remove all and insert in order
    await Employee.deleteMany({});
    if (cleaned.length > 0) {
      const docs = cleaned.map((name, index) => ({
        name,
        active: true,
        order: index,
      }));
      await Employee.insertMany(docs, { ordered: false });
    }

    return NextResponse.json({
      success: true,
      employees: cleaned,
    });
  } catch (error: any) {
    console.error("API PUT /api/employees error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

