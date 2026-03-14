import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Categorías por defecto que se crearán para cada nuevo usuario
const DEFAULT_CATEGORIES = [
  // Gastos
  { name: "Comida", type: "EXPENSE" as const, color: "#EF4444", icon: "🍔" },
  { name: "Transporte", type: "EXPENSE" as const, color: "#F59E0B", icon: "🚗" },
  { name: "Entretenimiento", type: "EXPENSE" as const, color: "#8B5CF6", icon: "🎮" },
  { name: "Servicios", type: "EXPENSE" as const, color: "#06B6D4", icon: "💡" },
  { name: "Salud", type: "EXPENSE" as const, color: "#10B981", icon: "🏥" },
  { name: "Educación", type: "EXPENSE" as const, color: "#3B82F6", icon: "📚" },
  { name: "Otros gastos", type: "EXPENSE" as const, color: "#6B7280", icon: "📦" },
  // Ingresos
  { name: "Salario", type: "INCOME" as const, color: "#10B981", icon: "💰" },
  { name: "Freelance", type: "INCOME" as const, color: "#8B5CF6", icon: "💼" },
  { name: "Inversiones", type: "INCOME" as const, color: "#F59E0B", icon: "📈" },
  { name: "Otros ingresos", type: "INCOME" as const, color: "#6B7280", icon: "💵" },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validación básica
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario y categorías en una transacción
    const user = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
      });

      // Crear categorías por defecto para el usuario
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          userId: newUser.id,
        })),
      });

      return newUser;
    });

    return NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    );
  }
}