import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Sedang mengisi database dengan data Alat Berat...');

  await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {
      wallet_Address: '0xAFd2e2BeDA7Cd7dFd860625Be551cE2946C1B56d'
    },
    create: {
      name: 'Agent Alat Berat (Budi)',
      email: 'agent@example.com',
      password: 'password123',
      wallet_Address: '0xAFd2e2BeDA7Cd7dFd860625Be551cE2946C1B56d',
      role: 'Agent'
    }
  });

  await prisma.user.upsert({
    where: { email: 'auditor@example.com' },
    update: {},
    create: {
      name: 'Inspektor Gadget',
      email: 'auditor@example.com',
      password: 'password123',
      wallet_Address: '0x0987654321098765432109876543210987654321',
      role: 'Auditor'
    }
  });

  const items = [
    { name: 'Caterpillar 320 Excavator', price: 1800000000, stock: 5 },
    { name: 'Komatsu D65 Bulldozer', price: 2500000000, stock: 2 },
    { name: 'Sany SY215C Excavator', price: 1600000000, stock: 4 },
    { name: 'Zoomlion QUY50 Crane', price: 3200000000, stock: 1 },
    { name: 'Volvo FMX Dump Truck', price: 2100000000, stock: 3 },
  ];

  await prisma.item.deleteMany({});

  for (const item of items) {
    await prisma.item.create({
      data: item
    });
  }

  console.log('Seed database berhasil! Data Alat Berat telah ditambahkan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
