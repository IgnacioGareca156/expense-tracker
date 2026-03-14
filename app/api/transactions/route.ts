import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener transacciones del usuario
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

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const type = searchParams.get("type");

    // Construir filtros
    const where: any = { userId: user.id };

    if (year) {
      if (month) {
        // Filtro por mes específico
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        where.date = {
          gte: startDate,
          lte: endDate
        };
      } else {
        // Filtro por año completo
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31);
        where.date = {
          gte: startDate,
          lte: endDate
        };
      }
    }

    if (type && (type === "INCOME" || type === "EXPENSE")) {
      where.type = type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        date: "desc"
      }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva transacción
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
    const { amount, description, type, date, categoryId } = body;

    // Validación básica
    if (!amount || !type || !date || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, type, date, or categoryId" },
        { status: 400 }
      );
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        date: new Date(date),
        categoryId: categoryId,
        userId: user.id
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}