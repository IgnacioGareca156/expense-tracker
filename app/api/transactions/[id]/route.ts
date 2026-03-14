import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// PUT - Actualizar transacción
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    const body = await request.json();
    const { amount, description, type, date, categoryId } = body;

    // Validación básica
    if (!amount || !type || !date || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, type, date, or categoryId" },
        { status: 400 }
      );
    }

    // Verificar que la transacción pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const transaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        amount: parseFloat(amount),
        description,
        type,
        date: new Date(date),
        categoryId: categoryId,
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar transacción
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // Verificar que la transacción pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}