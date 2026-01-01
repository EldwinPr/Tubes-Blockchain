import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.transaction_Details.deleteMany({});
  await prisma.transaction.deleteMany({});
  console.log('Cleared Transaction and Transaction_Details tables.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
