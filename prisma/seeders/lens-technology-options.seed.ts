
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  }
];

async function main() {
  console.log("Seeding lens technology-option mappings...");

  for (const mapping of technologyOptionMappings) {
    const lensOption = await prisma.lensOption.findUnique({
      where: { code: mapping.optionCode },
    });

    if (!lensOption) {
      throw new Error(
        `LensOption not found: ${mapping.optionCode}`,
      );
    }

    for (const technologyCode of mapping.technologyCodes) {
      const technology = await prisma.lensTechnology.findUnique({
        where: { code: technologyCode },
      });

      if (!technology) {
        throw new Error(
          `LensTechnology not found: ${technologyCode}`,
        );
      }

      await prisma.lensTechnologyOption.upsert({
        where: {
          lensOptionId_lensTechnologyId: {
            lensOptionId: lensOption.id,
            lensTechnologyId: technology.id,
          },
        },
        update: {
          active: true,
        },
        create: {
          lensOptionId: lensOption.id,
          lensTechnologyId: technology.id,
          active: true,
        },
      });

      console.log(
        `Mapped: ${lensOption.code} -> ${technology.code}`,
      );
    }
  }

  const count = await prisma.lensTechnologyOption.count();

  console.log(
    `Seeding completed. Total mappings: ${count}`,
  );
}

main()
  .catch((error) => {
    console.error("Lens technology-option seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
