import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener categorías del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Obtener tipo de query parameter (opcional)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: any = { userId: user.id };
    
    if (type && (type === "INCOME" || type === "EXPENSE")) {
      where.type = type;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: [
        { type: "asc" },
        { name: "asc" }
      ]
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, color, icon } = body;

    // Validación básica
    if (!name || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        { error: "Invalid category type" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        color: color || "#3B82F6",
        icon: icon || "📦",
        userId: user.id
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}