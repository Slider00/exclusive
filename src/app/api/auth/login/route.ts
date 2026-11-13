import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const userClean = (username || "").trim().toLowerCase();
    const passClean = (password || "").trim();

    if (!userClean || !passClean) {
      return NextResponse.json(
        { success: false, message: "Por favor ingresa usuario y contraseña" },
        { status: 400 }
      );
    }

    // Credenciales configurables por Variables de Entorno (o valores por defecto)
    const envAdminUser = (process.env.ADMIN_USERNAME || "exclusivespa_admin").toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD || "admin1234*";

    const envWorkerUser = (process.env.WORKER_USERNAME || "exclusivespa_trabajador").toLowerCase();
    const envWorkerPass = process.env.WORKER_PASSWORD || "trabajo1234*";

    // 1. Rol Administrador / Finanzas (Acceso total a Caja, Gastos y Finanzas)
    const isAdminUserMatch =
      userClean === envAdminUser ||
      userClean === "exclusivespa_admin" ||
      userClean === "exclusivespaadmin" ||
      userClean === "exclusivespafinanzas" ||
      userClean === "exclusivespa_finanzas";

    if (isAdminUserMatch && passClean === envAdminPass) {
      return NextResponse.json({
        success: true,
        user: {
          username: userClean,
          role: "Director General & Finanzas",
          canViewFinancials: true,
        },
      });
    }

    // 2. Rol Trabajador / Operador de Bahías (Sin acceso a Finanzas ni Dinero)
    const isWorkerUserMatch =
      userClean === envWorkerUser ||
      userClean === "exclusivespa_trabajador" ||
      userClean === "exclusivespatrabajador" ||
      userClean === "exclusivespa_operador" ||
      userClean === "exclusivespaoperador";

    if (isWorkerUserMatch && passClean === envWorkerPass) {
      return NextResponse.json({
        success: true,
        user: {
          username: userClean,
          role: "Operador de Bahías & Taller",
          canViewFinancials: false,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Usuario o contraseña incorrectos" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Error procesando autenticación" },
      { status: 500 }
    );
  }
}

