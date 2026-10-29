import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const lensTechnologies = [
  {
    code: "standard_light_adaptive",
    name: "Standard light-adaptive",
    description:
      "Light-adaptive lenses that adjust to changing light conditions.",
    sortOrder: 1,
  },
  {
    code: "standard_light_adaptive_blue_light",
    name: "Standard light-adaptive + blue-light",
    description:
      "Light-adaptive lenses with blue-light protection included.",
    sortOrder: 2,
  },
  {
    code: "transitions_gen_s",
    name: "Transitions® GEN S",
    description: "Transitions GEN S light-adaptive lens technology.",
    sortOrder: 3,
  },
  {
    code: "transitions_xtractive",
    name: "Transitions® XTRActive",
    description:
      "Extra-dark light-adaptive lenses designed to work in the car.",
    sortOrder: 4,
  },
  {
    code: "in_car_light_adaptive_blue_light",
    name: "In-car light-adaptive + blue-light",
    description:
      "Light-adaptive lenses with blue-light protection for driving.",
    sortOrder: 5,
  },
];

async function main() {
  console.log("Seeding lens technologies...");

  for (const technology of lensTechnologies) {
    const result = await prisma.lensTechnology.upsert({
      where: { code: technology.code },
      update: {
        name: technology.name,
        description: technology.description,
        sortOrder: technology.sortOrder,
      },
      create: {
        ...technology,
        active: true,
      },
    });

    console.log(`Seeded: ${result.name} (${result.code})`);
  }

  const count = await prisma.lensTechnology.count();

  console.log(`Lens technology seed completed. Total records: ${count}`);
}

main()
  .catch((error) => {
    console.error("Lens technology seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
