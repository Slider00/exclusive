import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: false,
        fallback: true,
        products: [],
      });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        fallback: true,
        products: [],
      });
    }

    const products = await Product.find().sort({ createdAt: 1 }).lean();

    const formatted = products.map((p: any) => ({
      id: p.id || p._id.toString(),
      name: p.name,
      shortName: p.shortName || p.name,
      brandLine: p.brandLine || "Exclusive Detailing Lab",
      category: p.category || "exterior",
      categoryLabel: p.categoryLabel || "Pre-Lavado & Champú",
      badge: p.badge || "Insumo Oficial",
      price: Number(p.price) || 0,
      presentation: p.presentation || "500 ml",
      techSpec: p.techSpec || "Fórmula Profesional",
      phLevel: p.phLevel || "pH 7.0 Neutro",
      protectionDuration: p.protectionDuration || "Protección Activa",
      image: p.image || "/images/products/shampoo-snow-foam.jpg",
      summary: p.summary || "",
      description: p.description || "",
      howWeUseIt: p.howWeUseIt || "",
      benefits: Array.isArray(p.benefits) ? p.benefits : [],
      applicationAreas: Array.isArray(p.applicationAreas) ? p.applicationAreas : [],
      includedInServices: Array.isArray(p.includedInServices) ? p.includedInServices : [],
    }));

    return NextResponse.json({
      success: true,
      fallback: false,
      products: formatted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, fallback: true, error: error.message, products: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!isMongoConfigured()) {
      return NextResponse.json({ success: false, fallback: true });
    }

    await connectToDatabase();

    const productId = data.id || `prod-${Date.now()}`;

    const saved = await Product.findOneAndUpdate(
      { id: productId },
      {
        ...data,
        id: productId,
        price: Number(data.price) || 0,
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      product: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, fallback: true, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!isMongoConfigured() || !id) {
      return NextResponse.json({ success: false, fallback: true });
    }

    await connectToDatabase();
    await Product.deleteOne({ id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, fallback: true, error: error.message },
      { status: 500 }
    );
  }
}

