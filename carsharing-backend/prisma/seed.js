const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@carsharing.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@carsharing.local',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const cars = [
    { brand: 'BMW', model: '3 Series', year: 2023, pricePerHour: 25, transmission: 'AUTOMATIC', fuel: 'PETROL', seats: 5 },
    { brand: 'Tesla', model: 'Model 3', year: 2024, pricePerHour: 35, transmission: 'AUTOMATIC', fuel: 'ELECTRIC', seats: 5 },
    { brand: 'Volkswagen', model: 'Golf', year: 2022, pricePerHour: 15, transmission: 'MANUAL', fuel: 'DIESEL', seats: 5 },
    { brand: 'Mercedes-Benz', model: 'C-Class', year: 2023, pricePerHour: 30, transmission: 'AUTOMATIC', fuel: 'PETROL', seats: 5 },
  ];

  for (const car of cars) {
    await prisma.car.create({ data: car });
  }

  console.log('Seed завершено: створено admin та тестові авто');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
