const { PrismaClient } = require('@prisma/client');

// Singleton, щоб не створювати нове з'єднання при кожному імпорті
const prisma = new PrismaClient();

module.exports = prisma;
