import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const lensTypeCodes = [
  "single_vision_distance",
  "single_vision_reading",
  "progressive",
];

const technologyOptionMappings = [
  {
    optionCode: "light_adaptive",
    technologyCodes: [
      "standard_light_adaptive",
      "standard_light_adaptive_blue_light",
      "transitions_gen_s",
      "transitions_xtractive",
      "in_car_light_adaptive_blue_light",
    ],
  },
  {
    optionCode: "sunglasses_tinted",
    technologyCodes: [
      "sunglasses_tinted",
      "sunglasses_tinted_blue_light",
    ],
  },
  {
    optionCode: "sunglasses_polarized",
    technologyCodes: [
      "sunglasses_solid_polarized",
      "sunglasses_mirror_polarized",
    ],
  },
];

async function main() {
  console.log("Seeding lens technology-option mappings...");

  // Resolve the lens types once.
  const lensTypes = await prisma.lensType.findMany({
    where: {
      code: { in: lensTypeCodes },
    },
    select: {
      id: true,
      code: true,
    },
  });

  const lensTypeByCode = new Map(
    lensTypes.map((lensType) => [lensType.code, lensType]),
  );

  for (const lensTypeCode of lensTypeCodes) {
    if (!lensTypeByCode.has(lensTypeCode)) {
      throw new Error(`LensType not found: ${lensTypeCode}`);
    }
  }

  for (const mapping of technologyOptionMappings) {
    const lensOption = await prisma.lensOption.findUnique({
      where: { code: mapping.optionCode },
      select: { id: true, code: true },
    });

    if (!lensOption) {
      throw new Error(`LensOption not found: ${mapping.optionCode}`);
    }

    for (const technologyCode of mapping.technologyCodes) {
      const technology = await prisma.lensTechnology.findUnique({
        where: { code: technologyCode },
        select: { id: true, code: true },
      });

      if (!technology) {
        throw new Error(`LensTechnology not found: ${technologyCode}`);
      }

      for (const lensTypeCode of lensTypeCodes) {
        const lensType = lensTypeByCode.get(lensTypeCode)!;

        await prisma.lensTechnologyOption.upsert({
          where: {
            lensTypeId_lensOptionId_lensTechnologyId: {
              lensTypeId: lensType.id,
              lensOptionId: lensOption.id,
              lensTechnologyId: technology.id,
            },
          },
          update: {
            active: true,
          },
          create: {
            lensTypeId: lensType.id,
            lensOptionId: lensOption.id,
            lensTechnologyId: technology.id,
            active: true,
          },
        });
      }

      console.log(
        `Mapped ${technology.code} to ${lensOption.code} for all three lens types.`,
      );
    }
  }

  const count = await prisma.lensTechnologyOption.count({
    where: {
      active: true,
      lensType: {
        code: { in: lensTypeCodes },
      },
    },
  });

  console.log(`Seeding completed. Active mappings for these lens types: ${count}`);
}

main()
  .catch((error) => {
    console.error("Lens technology-option seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
