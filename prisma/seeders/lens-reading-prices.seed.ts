import { PrismaClient, LensPriceKind } from "@prisma/client";

const prisma = new PrismaClient();

const CURRENCY_CODE = "USD";
const BASE_PRICE_MINOR = 3000;

function getIndexUpgradeMinor(refractiveIndex: number): number {
  if (refractiveIndex <= 1.5) return 0;
  if (refractiveIndex <= 1.56) return 500;
  if (refractiveIndex <= 1.6) return 1000;
  if (refractiveIndex <= 1.67) return 1500;
  return 2000;
}

async function seedReadingLensPrices() {
  const lensType = await prisma.lensType.findUnique({
    where: { code: "single_vision_reading" },
  });

  if (!lensType) {
    throw new Error(
      'Lens type "single_vision_reading" not found. Seed lens types first.',
    );
  }

  const lensIndices = await prisma.lensIndex.findMany({
    where: { active: true },
    orderBy: { refractiveIndex: "asc" },
  });

  if (lensIndices.length === 0) {
    throw new Error("No active lens indices found. Seed lens indices first.");
  }

  const baseCode = "test-single_vision_reading-base-usd";

  await prisma.lensPrice.upsert({
    where: { code: baseCode },
    update: {
      kind: LensPriceKind.base,
      amountMinor: BASE_PRICE_MINOR,
      currencyCode: CURRENCY_CODE,
      lensTypeId: lensType.id,
      lensIndexId: null,
      lensOptionId: null,
      active: true,
    },
    create: {
      code: baseCode,
      kind: LensPriceKind.base,
      amountMinor: BASE_PRICE_MINOR,
      currencyCode: CURRENCY_CODE,
      lensTypeId: lensType.id,
      active: true,
    },
  });

  for (const index of lensIndices) {
    const refractiveIndex = Number(index.refractiveIndex);
    const amountMinor = getIndexUpgradeMinor(refractiveIndex);
    const code = `test-single_vision_reading-${index.code}-upgrade-usd`;

    await prisma.lensPrice.upsert({
      where: { code },
      update: {
        kind: LensPriceKind.upgrade,
        amountMinor,
        currencyCode: CURRENCY_CODE,
        lensTypeId: lensType.id,
        lensIndexId: index.id,
        lensOptionId: null,
        active: true,
      },
      create: {
        code,
        kind: LensPriceKind.upgrade,
        amountMinor,
        currencyCode: CURRENCY_CODE,
        lensTypeId: lensType.id,
        lensIndexId: index.id,
        active: true,
      },
    });

    console.log(
      `${index.code} (${refractiveIndex}): $${(amountMinor / 100).toFixed(2)} upgrade`,
    );
  }

  console.log(
    `Seeded 1 base price and ${lensIndices.length} index upgrade prices for single_vision_reading.`,
  );
}

seedReadingLensPrices()
  .catch((error) => {
    console.error("Reading lens price seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });