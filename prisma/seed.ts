import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Sedang mengisi database dengan data Alat Berat...');

  // 1. Buat Agent
  await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      name: 'Agent Alat Berat (Budi)',
      email: 'agent@example.com',
      password: 'password123',
      wallet_Address: '0x1234567890123456789012345678901234567890',
      role: 'Agent'
    }
  });

  // 2. Buat Auditor (Inspektor Alat Berat)
  await prisma.user.upsert({
    where: { email: 'auditor@example.com' },
    update: {},
    create: {
      name: 'Inspektor Siti',
      email: 'auditor@example.com',
      password: 'password123',
      wallet_Address: '0x0987654321098765432109876543210987654321',
      role: 'Auditor'
    }
  });

  // 3. Buat 5 Items (Alat Berat)
  // Use Case: Aset bernilai tinggi yang memerlukan inspeksi (audit) dan transparansi komisi.
  const items = [
    { name: 'Caterpillar 320 Excavator', price: 1800000000, stock: 5 },
    { name: 'Komatsu D65 Bulldozer', price: 2500000000, stock: 2 },
    { name: 'Sany SY215C Excavator', price: 1600000000, stock: 4 },
    { name: 'Zoomlion QUY50 Crane', price: 3200000000, stock: 1 },
    { name: 'Volvo FMX Dump Truck', price: 2100000000, stock: 3 },
  ];

  // Hapus item lama agar tidak duplikat
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
