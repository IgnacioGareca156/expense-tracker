import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// PUT - Actualizar categoría
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
    const { name, type, color, icon } = body;

    // Verificar que la categoría pertenece al usuario
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const category = await prisma.category.update({
      where: { id: id },
      data: {
        name,
        type,
        color,
        icon,
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar categoría
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

    // Verificar que la categoría pertenece al usuario
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Verificar si hay transacciones usando esta categoría
    const transactionsCount = await prisma.transaction.count({
      where: { categoryId: id }
    });

    if (transactionsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${transactionsCount} transacción(es) usando esta categoría.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}