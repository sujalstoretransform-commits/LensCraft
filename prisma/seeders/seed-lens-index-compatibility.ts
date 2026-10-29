import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Development configuration only.
// Adjust these combinations to match your actual lens catalog.
const compatibility = [
  {
    lensTypeCode: "single_vision_distance",
    lensOptionCode: "clear",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    lensTypeCode: "single_vision_distance",
    lensOptionCode: "blue_light",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    lensTypeCode: "single_vision_distance",
    lensOptionCode: "light_adaptive",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    lensTypeCode: "single_vision_reading",
    lensOptionCode: "light_adaptive",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    lensTypeCode: "single_vision_reading",
    lensOptionCode: "clear",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    lensTypeCode: "single_vision_reading",
    lensOptionCode: "blue_light",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    lensTypeCode: "progressive",
    lensOptionCode: "clear",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
];

async function main() {
  for (const entry of compatibility) {
    const lensType = await prisma.lensType.findUnique({
      where: { code: entry.lensTypeCode },
    });

    if (!lensType) {
      throw new Error(`LensType not found: ${entry.lensTypeCode}`);
    }

    const lensOption = await prisma.lensOption.findUnique({
      where: { code: entry.lensOptionCode },
    });

    if (!lensOption) {
      throw new Error(`LensOption not found: ${entry.lensOptionCode}`);
    }

    for (const indexCode of entry.lensIndexCodes) {
      const lensIndex = await prisma.lensIndex.findUnique({
        where: { code: indexCode },
      });

      if (!lensIndex) {
        throw new Error(`LensIndex not found: ${indexCode}`);
      }

      await prisma.lensIndexCompatibility.upsert({
        where: {
          lensTypeId_lensOptionId_lensIndexId: {
            lensTypeId: lensType.id,
            lensOptionId: lensOption.id,
            lensIndexId: lensIndex.id,
          },
        },
        update: { active: true },
        create: {
          lensTypeId: lensType.id,
          lensOptionId: lensOption.id,
          lensIndexId: lensIndex.id,
          active: true,
        },
      });
    }
  }

  console.log("Lens index compatibility seeding completed.");
}

main()
  .catch((error) => {
    console.error("Failed to seed lens index compatibility:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });