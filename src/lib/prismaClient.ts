import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prismaClient = global.prisma || new PrismaClient();

if(process.env.NODE_ENV !== 'production') global.prisma = prismaClient;
// This ensures that the Prisma Client is reused in development to prevent exhausting database connections.