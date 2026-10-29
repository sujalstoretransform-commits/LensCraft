import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Development catalog configuration.
// Confirm the index codes exist in your database before running.
const compatibility = [
  {
    technologyCode: "standard_light_adaptive",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    technologyCode: "standard_light_adaptive_blue_light",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    technologyCode: "transitions_gen_s",
    lensIndexCodes: [
      "index_150",
      "index_156",
      "index_160",
      "index_167",
      "index_174",
    ],
  },
  {
    technologyCode: "transitions_xtractive",
    lensIndexCodes: [
      "index_150",
      "index_161",
      "index_167",
    ],
  },
  {
    technologyCode: "in_car_light_adaptive_blue_light",
    lensIndexCodes: [
      "index_161",
      "index_167",
    ],
  },
];

async function main() {
  for (const entry of compatibility) {
    const technology = await prisma.lensTechnology.findUnique({
      where: { code: entry.technologyCode },
    });

    if (!technology) {
      throw new Error(
        `LensTechnology not found: ${entry.technologyCode}`,
      );
    }

    for (const indexCode of entry.lensIndexCodes) {
      const lensIndex = await prisma.lensIndex.findUnique({
        where: { code: indexCode },
      });

      if (!lensIndex) {
        throw new Error(`LensIndex not found: ${indexCode}`);
      }

      await prisma.lensTechnologyIndexCompatibility.upsert({
        where: {
          lensTechnologyId_lensIndexId: {
            lensTechnologyId: technology.id,
            lensIndexId: lensIndex.id,
          },
        },
        update: {
          active: true,
        },
        create: {
          lensTechnologyId: technology.id,
          lensIndexId: lensIndex.id,
          active: true,
        },
      });
    }
  }

  console.log(
    "Lens technology index compatibility seeding completed.",
  );
}

main()
  .catch((error) => {
    console.error(
      "Failed to seed lens technology index compatibility:",
      error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });