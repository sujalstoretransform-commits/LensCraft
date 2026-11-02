
import { PrismaClient, LensPriceKind } from "@prisma/client";

const prisma = new PrismaClient();

const CURRENCY_CODE = "USD";

// TEST prices in cents. Replace with real pricing before production.
const BASE_PRICE_MINOR = 1000;

function getIndexUpgradeMinor(refractiveIndex: number): number {
  if (refractiveIndex <= 1.5) return 0;
  if (refractiveIndex <= 1.56) return 500;
  if (refractiveIndex <= 1.6) return 1000;
  if (refractiveIndex <= 1.67) return 1500;
  return 2000;
}

async function seedLensPrices() {
  // Support the codes used in the existing catalog and UI.
  const lensType =
    (await prisma.lensType.findUnique({
      where: { code: "single_vision_distance" },
    })) ??
    (await prisma.lensType.findUnique({
      where: { code: "single_vision" },
    }));

  if (!lensType) {
    throw new Error(
      'Single Vision lens type not found. Expected code "single_vision_distance" or "single_vision".',
    );
  }

  const lensIndices = await prisma.lensIndex.findMany({
    where: { active: true },
    orderBy: { refractiveIndex: "asc" },
  });

  if (lensIndices.length === 0) {
    throw new Error("No active lens indices found. Seed LensIndex first.");
  }

  await prisma.lensPrice.upsert({
    where: { code: `test-${lensType.code}-base-usd` },
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
      code: `test-${lensType.code}-base-usd`,
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

    const code = `test-${lensType.code}-${index.code}-upgrade-usd`;

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
    `Seeded 1 base price and ${lensIndices.length} index upgrade prices for ${lensType.code}.`,
  );
}

seedLensPrices()
  .catch((error) => {
    console.error("LensPrice seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
