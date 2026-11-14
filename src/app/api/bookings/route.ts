import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Expense from "@/models/Expense";

// GET /api/bookings - Fetch all bookings
export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "MONGODB_URI no configurado en Vercel Environment Variables",
        bookings: [],
      });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "No se pudo conectar a MongoDB",
        bookings: [],
      });
    }

    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

    const formatted = bookings.map((b: any) => ({
      id: b._id.toString(),
      code: b.code,
      licensePlate: b.licensePlate,
      vehicleType: b.vehicleType,
      serviceId: b.serviceId,
      serviceName: b.serviceName,
      originalPrice: b.originalPrice ?? b.price,
      discountPercent: b.discountPercent || 0,
      promoCode: b.promoCode || "",
      price: b.price,
      day: b.day,
      appointmentDate: b.appointmentDate || "",
      time: b.time,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      clientNotes: b.clientNotes || "",
      isWalkIn: Boolean(b.isWalkIn),
      bay: b.bay,
      stage: b.stage,
      stageName: b.stageName,
      assignedEmployee: b.assignedEmployee || "",
      paymentMethod: b.paymentMethod,
      isPaid: Boolean(b.isPaid),
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      fallback: false,
      count: formatted.length,
      bookings: formatted,
    });
  } catch (error: any) {
    console.error("API GET /api/bookings error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message, bookings: [] },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: false,
        fallback: true,
        message: "MONGODB_URI no configurado",
      });
    }

    await connectToDatabase();

    let code = (data.code || `EXC-${Math.floor(100000 + Math.random() * 900000)}`).toUpperCase();
    let codeExists = await Booking.exists({ code });
    while (codeExists) {
      code = `EXC-${Math.floor(100000 + Math.random() * 900000)}`;
      codeExists = await Booking.exists({ code });
    }

    const rawPlate = (data.licensePlate || "EXC-000").toUpperCase();
    const cleanAlphaPlate = rawPlate.replace(/[^A-Z0-9]/g, "");

    let discountPercent = Number(data.discountPercent) || 0;
    let promoCode = data.promoCode ? String(data.promoCode).toUpperCase() : "";
    const originalPrice = Number(data.originalPrice) || Number(data.price) || 0;
    let finalPrice = Number(data.price) || 0;

    // Server-side guard: ensure a plate can only redeem INAUGURACION15 once
    if (discountPercent > 0 || promoCode === "INAUGURACION15") {
      const allPlateBookings = await Booking.find({
        $or: [{ discountPercent: { $gt: 0 } }, { promoCode: "INAUGURACION15" }],
      }).lean();

      const alreadyUsed = allPlateBookings.some(
        (b: any) =>
          (b.licensePlate || "").toUpperCase().replace(/[^A-Z0-9]/g, "") ===
          cleanAlphaPlate
      );

      if (alreadyUsed) {
        discountPercent = 0;
        promoCode = "";
        finalPrice = originalPrice;
      }
    }

    const newBooking: any = await Booking.create({
      code,
      licensePlate: rawPlate,
      vehicleType: data.vehicleType || "carro",
      serviceId: data.serviceId || "lavado-full",
      serviceName: data.serviceName || "Lavado Full",
      originalPrice,
      discountPercent,
      promoCode,
      price: finalPrice,
      day: data.day || "Hoy",
      appointmentDate: data.appointmentDate || "",
      time: data.time || "10:00 AM",
      clientName: data.clientName || "Cliente",
      clientPhone: data.clientPhone || "3100000000",
      clientNotes: data.clientNotes || "",
      isWalkIn: Boolean(data.isWalkIn),
      bay: data.bay || "Bahía 1 (Lavado)",
      stage: (Number(data.stage) || 1) as 1 | 2 | 3 | 4 | 5,
      stageName: data.stageName || "En Espera / Recepción",
      assignedEmployee: data.assignedEmployee || "",
      paymentMethod: data.paymentMethod || "pendiente",
      isPaid: Boolean(data.isPaid),
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: newBooking._id.toString(),
        code: newBooking.code,
        licensePlate: newBooking.licensePlate,
        vehicleType: newBooking.vehicleType,
        serviceId: newBooking.serviceId,
        serviceName: newBooking.serviceName,
        originalPrice: newBooking.originalPrice,
        discountPercent: newBooking.discountPercent,
        promoCode: newBooking.promoCode,
        price: newBooking.price,
        day: newBooking.day,
        appointmentDate: newBooking.appointmentDate,
        time: newBooking.time,
        clientName: newBooking.clientName,
        clientPhone: newBooking.clientPhone,
        clientNotes: newBooking.clientNotes,
        isWalkIn: newBooking.isWalkIn,
        bay: newBooking.bay,
        stage: newBooking.stage,
        stageName: newBooking.stageName,
        assignedEmployee: newBooking.assignedEmployee || "",
        paymentMethod: newBooking.paymentMethod,
        isPaid: newBooking.isPaid,
        createdAt: newBooking.createdAt ? new Date(newBooking.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: newBooking.updatedAt ? new Date(newBooking.updatedAt).toISOString() : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("API POST /api/bookings error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/bookings - Update booking stage / payment / bay / schedule (reschedule)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      id,
      code,
      stage,
      stageName,
      bay,
      isPaid,
      paymentMethod,
      assignedEmployee,
      day,
      appointmentDate,
      time,
      clientNotes,
    } = data;

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: false, fallback: true });
    }

    await connectToDatabase();

    const isObjectId = typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    const query: any = {};
    if (isObjectId) {
      query._id = id;
    } else if (code) {
      query.code = String(code).toUpperCase();
    } else if (typeof id === "string" && id.toUpperCase().startsWith("EXC-")) {
      query.code = id.toUpperCase();
    } else {
      return NextResponse.json({ success: false, message: "Identificador de reserva no válido" }, { status: 400 });
    }

    const updateFields: any = { updatedAt: new Date() };
    if (stage !== undefined) updateFields.stage = stage;
    if (stageName !== undefined) updateFields.stageName = stageName;
    if (bay !== undefined) updateFields.bay = bay;
    if (isPaid !== undefined) updateFields.isPaid = isPaid;
    if (paymentMethod !== undefined) updateFields.paymentMethod = paymentMethod;
    if (assignedEmployee !== undefined) updateFields.assignedEmployee = assignedEmployee;
    if (day !== undefined) updateFields.day = day;
    if (appointmentDate !== undefined) updateFields.appointmentDate = appointmentDate;
    if (time !== undefined) updateFields.time = time;
    if (clientNotes !== undefined) updateFields.clientNotes = clientNotes;

    const updated = await Booking.findOneAndUpdate(query, updateFields, {
      new: true,
    }).lean();

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (error: any) {
    console.error("API PUT /api/bookings error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings - Delete booking (or all if all=true)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const code = searchParams.get("code");
    const all = searchParams.get("all");

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: false, fallback: true });
    }

    await connectToDatabase();

    if (all === "true") {
      await Booking.deleteMany({});
      return NextResponse.json({ success: true, clearedAll: true });
    }

    const isObjectId = typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    const query: any = {};
    if (isObjectId) {
      query._id = id;
    } else if (code) {
      query.code = code.toUpperCase();
    } else if (typeof id === "string" && id.toUpperCase().startsWith("EXC-")) {
      query.code = id.toUpperCase();
    } else {
      return NextResponse.json({ success: false, message: "Identificador no válido" }, { status: 400 });
    }

    await Booking.deleteOne(query);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API DELETE /api/bookings error:", error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message },
      { status: 500 }
    );
  }
}
