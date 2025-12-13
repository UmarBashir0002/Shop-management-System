// backend/scripts/seedItems.js
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      name: "HP LaserJet 1020",
      brand: "HP",
      type: "PRINTER",
      costPrice: 12000,
      salePrice: 15000,
      quantity: 5,
    },
    {
      name: "Dell Inspiron 15",
      brand: "Dell",
      type: "LAPTOP",
      costPrice: 50000,
      salePrice: 65000,
      quantity: 3,
    },
    {
      name: "Canon Cartridge 301",
      brand: "Canon",
      type: "ACCESSORY",
      costPrice: 800,
      salePrice: 1200,
      quantity: 20,
    },
    {
      name: "A4 Color Print (per page)",
      brand: "Service",
      type: "SERVICE",
      costPrice: 0,
      salePrice: 10,
      quantity: 0,
    },
  ];

  for (const it of items) {
    await prisma.item.create({ data: it });
  }

  console.log('Seeded items.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
