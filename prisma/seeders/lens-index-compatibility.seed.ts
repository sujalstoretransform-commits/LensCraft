import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const lensTypeOptionMappings = [
  {
    lensTypeCode: "single_vision_distance",
    lensOptionCodes: [
      "clear",
      "blue_light",
      "light_adaptive",
      "sunglasses_tinted",
      "sunglasses_polarized",
    ],
  },
  {
    lensTypeCode: "single_vision_reading",
    lensOptionCodes: [
      "clear",
      "blue_light",
      "light_adaptive",
      "sunglasses_tinted",
      "sunglasses_polarized",
    ],
  },
];

const technologyCodesByOption: Record<string, string[]> = {
  light_adaptive: [
    "standard_light_adaptive",
    "standard_light_adaptive_blue_light",
    "transitions_gen_s",
    "transitions_xtractive",
    "in_car_light_adaptive_blue_light",
  ],
  sunglasses_tinted: ["sunglasses_tinted", "sunglasses_tinted_blue_light"],
  sunglasses_polarized: [
    "sunglasses_solid_polarized",
    "sunglasses_mirror_polarized",
  ],
};

const standardIndexCodes = [
  "index_156",
  "index_159",
  "index_161",
  "index_167",
  "index_174",
];

const technologyIndexMappings: Record<string, string[]> = {
  standard_light_adaptive: [
    "index_156",
    "index_159",
    "index_161",
    "index_167",
    "index_174",
  ],
  standard_light_adaptive_blue_light: [
    "index_156",
    "index_159",
    "index_161",
    "index_167",
    "index_174",
  ],
  transitions_gen_s: [
    "index_150",
    "index_159",
    "index_161",
    "index_167",
    "index_174",
  ],
  transitions_xtractive: ["index_150", "index_161", "index_167"],
  in_car_light_adaptive_blue_light: ["index_161", "index_167"],
  sunglasses_tinted: ["index_161", "index_167"],
  sunglasses_tinted_blue_light: ["index_161", "index_167"],
  sunglasses_solid_polarized: [
    "index_156",
    "index_159",
    "index_161",
    "index_167",
  ],
  sunglasses_mirror_polarized: ["index_156", "index_161", "index_167"],
};

async function main() {
  const [lensTypes, lensOptions, lensTechnologies, lensIndices] =
    await Promise.all([
      prisma.lensType.findMany({
        where: { active: true },
        select: { id: true, code: true },
      }),
      prisma.lensOption.findMany({
        where: { active: true },
        select: { id: true, code: true },
      }),
      prisma.lensTechnology.findMany({
        where: { active: true },
        select: { id: true, code: true },
      }),
      prisma.lensIndex.findMany({
        where: { active: true },
        select: { id: true, code: true },
      }),
    ]);

  const lensTypeByCode = new Map(
    lensTypes.map((item) => [item.code, item]),
  );
  const lensOptionByCode = new Map(
    lensOptions.map((item) => [item.code, item]),
  );
  const technologyByCode = new Map(
    lensTechnologies.map((item) => [item.code, item]),
  );
  const lensIndexByCode = new Map(
    lensIndices.map((item) => [item.code, item]),
  );

  const rows: {
    lensTypeId: string;
    lensOptionId: string;
    lensTechnologyId: string | null;
    lensIndexId: string;
    active: boolean;
  }[] = [];

  for (const mapping of lensTypeOptionMappings) {
    const lensType = lensTypeByCode.get(mapping.lensTypeCode);

    if (!lensType) {
      throw new Error(
        `Active LensType "${mapping.lensTypeCode}" was not found.`,
      );
    }

    for (const optionCode of mapping.lensOptionCodes) {
      const lensOption = lensOptionByCode.get(optionCode);

      if (!lensOption) {
        throw new Error(
          `Active LensOption "${optionCode}" was not found.`,
        );
      }

      const technologyCodes = technologyCodesByOption[optionCode];

      // Regular options do not require a technology.
      if (!technologyCodes) {
        for (const indexCode of standardIndexCodes) {
          const lensIndex = lensIndexByCode.get(indexCode);

          if (!lensIndex) {
            throw new Error(
              `Active LensIndex "${indexCode}" was not found.`,
            );
          }

          rows.push({
            lensTypeId: lensType.id,
            lensOptionId: lensOption.id,
            lensTechnologyId: null,
            lensIndexId: lensIndex.id,
            active: true,
          });
        }

        continue;
      }

      // Technology-based options use their configured index mappings.
      for (const technologyCode of technologyCodes) {
        const technology = technologyByCode.get(technologyCode);

        if (!technology) {
          throw new Error(
            `Active LensTechnology "${technologyCode}" was not found.`,
          );
        }

        const indexCodes = technologyIndexMappings[technologyCode];

        if (!indexCodes?.length) {
          throw new Error(
            `No index mapping configured for technology "${technologyCode}".`,
          );
        }

        for (const indexCode of indexCodes) {
          const lensIndex = lensIndexByCode.get(indexCode);

          if (!lensIndex) {
            throw new Error(
              `Active LensIndex "${indexCode}" was not found.`,
            );
          }

          rows.push({
            lensTypeId: lensType.id,
            lensOptionId: lensOption.id,
            lensTechnologyId: technology.id,
            lensIndexId: lensIndex.id,
            active: true,
          });
        }
      }
    }
  }

  // Replace existing compatibility records.
  await prisma.$transaction([
    prisma.lensIndexCompatibility.deleteMany(),
    prisma.lensIndexCompatibility.createMany({
      data: rows,
    }),
  ]);

  console.log(
    `Lens index compatibility seeding completed: ${rows.length} records created.`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed lens index compatibilities:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });