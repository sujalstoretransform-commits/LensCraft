import {
  PrismaClient,
  LensFamily,
  LensPriceKind,
  LensOptionCategory,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Lens Type
  const clear = await prisma.lensType.upsert({
    where: { code: "clear" },
    update: {
      name: "Clear",
      family: LensFamily.clear,
      active: true,
    },
    create: {
      code: "clear",
      name: "Clear",
      family: LensFamily.clear,
      active: true,
    },
  });

  // 2. Lens Index
  const index167 = await prisma.lensIndex.upsert({
    where: { code: "1.67" },
    update: {
      displayName: "Thin 1.67",
      refractiveIndex: "1.67",
      active: true,
    },
    create: {
      code: "1.67",
      displayName: "Thin 1.67",
      refractiveIndex: "1.67",
      active: true,
    },
  });

  // 3. Lens Option
  const antiFog = await prisma.lensOption.upsert({
    where: { code: "anti_fog" },
    update: {
      name: "Anti-fog",
      category: LensOptionCategory.add_on,
      active: true,
    },
    create: {
      code: "anti_fog",
      name: "Anti-fog",
      category: LensOptionCategory.add_on,
      active: true,
    },
  });

  // 4. Lens Prices
  const prices = [
    {
      code: "test-clear-base",
      kind: LensPriceKind.base,
      amountMinor: 1000,
      currencyCode: "USD",
      lensTypeId: clear.id,
      lensIndexId: null,
      lensOptionId: null,
    },
    {
      code: "test-clear-167",
      kind: LensPriceKind.upgrade,
      amountMinor: 500,
      currencyCode: "USD",
      lensTypeId: clear.id,
      lensIndexId: index167.id,
      lensOptionId: null,
    },
    {
      code: "test-antifog",
      kind: LensPriceKind.add_on,
      amountMinor: 300,
      currencyCode: "USD",
      lensTypeId: null,
      lensIndexId: null,
      lensOptionId: antiFog.id,
    },
  ];

  for (const price of prices) {
    await prisma.lensPrice.upsert({
      where: { code: price.code },
      update: {
        kind: price.kind,
        amountMinor: price.amountMinor,
        currencyCode: price.currencyCode,
        lensTypeId: price.lensTypeId,
        lensIndexId: price.lensIndexId,
        lensOptionId: price.lensOptionId,
        active: true,
      },
      create: {
        ...price,
        active: true,
      },
    });
  }

  console.log("Lens pricing test data seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });