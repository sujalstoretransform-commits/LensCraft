import { PrismaClient, LensFamily, LensOptionCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Lens types
  const lensTypes = [
    {
      code: "single_vision",
      name: "Single Vision",
      family: LensFamily.clear,
      description: "Single-vision lenses for one field of vision.",
    },
    {
      code: "bifocal",
      name: "Bifocal",
      family: LensFamily.clear,
      description: "Bifocal lenses with two fields of vision.",
    },
    {
      code: "progressive",
      name: "Progressive",
      family: LensFamily.clear,
      description: "Progressive lenses with multiple fields of vision.",
    },
  ];

  for (const lensType of lensTypes) {
    await prisma.lensType.upsert({
      where: { code: lensType.code },
      update: {
        name: lensType.name,
        family: lensType.family,
        description: lensType.description,
      },
      create: lensType,
    });
  }

  // Lens indices — sample catalog values; confirm supplier availability.
  const lensIndices = [
    { code: "index_150", displayName: "1.50", refractiveIndex: "1.50" },
    { code: "index_156", displayName: "1.56", refractiveIndex: "1.56" },
    { code: "index_160", displayName: "1.60", refractiveIndex: "1.60" },
    { code: "index_167", displayName: "1.67", refractiveIndex: "1.67" },
    { code: "index_174", displayName: "1.74", refractiveIndex: "1.74" },
  ];

  for (const lensIndex of lensIndices) {
    await prisma.lensIndex.upsert({
      where: { code: lensIndex.code },
      update: {
        displayName: lensIndex.displayName,
        refractiveIndex: lensIndex.refractiveIndex,
      },
      create: lensIndex,
    });
  }

  // Sample options — availability must be confirmed with the supplier.
  const lensOptions = [
    {
      code: "progressive_design",
      name: "Progressive Design",
      category: LensOptionCategory.progressive_design,
      description: "Progressive lens design.",
    },
    {
      code: "bifocal_design",
      name: "Bifocal Design",
      category: LensOptionCategory.bifocal_design,
      description: "Bifocal lens design.",
    },
    {
      code: "anti_reflective",
      name: "Anti-Reflective Coating",
      category: LensOptionCategory.coating,
      description: "Anti-reflective coating option.",
    },
    {
      code: "blue_light_filter",
      name: "Blue-Light Filter",
      category: LensOptionCategory.add_on,
      description: "Blue-light filtering add-on.",
    },
  ];

  for (const lensOption of lensOptions) {
    await prisma.lensOption.upsert({
      where: { code: lensOption.code },
      update: {
        name: lensOption.name,
        category: lensOption.category,
        description: lensOption.description,
      },
      create: lensOption,
    });
  }

  console.log("Lens catalog seed completed.");
}

main()
  .catch((error) => {
    console.error("Lens catalog seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });