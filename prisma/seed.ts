import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg(new pg.Pool({ connectionString })),
});

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

async function main() {
  console.log("🌱 Iniciando seed...");

  // Crear usuario de prueba
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Usuario de Prueba",
      passwordHash,
    },
  });

  console.log(`✅ Usuario creado: ${user.email}`);

  // Crear categorías
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        name_userId_type: {
          name: category.name,
          userId: user.id,
          type: category.type,
        },
      },
      update: {},
      create: {
        ...category,
        userId: user.id,
      },
    });
  }

  console.log(`✅ ${DEFAULT_CATEGORIES.length} categorías creadas`);

  // Crear algunas transacciones de ejemplo
  const comidaCategory = await prisma.category.findFirst({
    where: { name: "Comida", userId: user.id },
  });

  const salarioCategory = await prisma.category.findFirst({
    where: { name: "Salario", userId: user.id },
  });

  if (comidaCategory && salarioCategory) {
    await prisma.transaction.createMany({
      data: [
        {
          amount: 3000,
          description: "Salario mensual",
          type: "INCOME",
          date: new Date(),
          categoryId: salarioCategory.id,
          userId: user.id,
        },
        {
          amount: 50.5,
          description: "Almuerzo en restaurante",
          type: "EXPENSE",
          date: new Date(),
          categoryId: comidaCategory.id,
          userId: user.id,
        },
        {
          amount: 120.0,
          description: "Compras del supermercado",
          type: "EXPENSE",
          date: new Date(Date.now() - 86400000), // Ayer
          categoryId: comidaCategory.id,
          userId: user.id,
        },
      ],
    });

    console.log("✅ Transacciones de ejemplo creadas");
  }

  console.log("🎉 Seed completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });