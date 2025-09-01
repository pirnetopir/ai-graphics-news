import { PrismaClient } from "@prisma/client";

// Ensure single Prisma instance in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== "production") (globalForPrisma as any).prisma = prisma;
