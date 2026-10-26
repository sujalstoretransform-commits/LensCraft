// Fake development data for Single Vision lens indices.
// Add this after your existing LensType seed.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const singleVision = await prisma.lensType.upsert({
    where: { code: "single_vision" },
    update: {
        active: true,
    },
    create: {
        code: "single_vision",
        name: "Single Vision",
        family: "clear",
        description: "Single-vision lenses for one field of vision.",
        active: true,
    },
});

const indexData = [
    { code: "index_150", name: "Standard 1.50", value: "1.50", price: 2500 },
    { code: "index_156", name: "Thin 1.56", value: "1.56", price: 3500 },
    { code: "index_160", name: "Thin 1.60", value: "1.60", price: 5000 },
    { code: "index_167", name: "Extra Thin 1.67", value: "1.67", price: 7500 },
    { code: "index_174", name: "Ultra Thin 1.74", value: "1.74", price: 11000 },
];

for (const item of indexData) {
    const index = await prisma.lensIndex.upsert({
        where: { code: item.code },
        update: {
            displayName: item.name,
            refractiveIndex: item.value,
            active: true,
        },
        create: {
            code: item.code,
            displayName: item.name,
            refractiveIndex: item.value,
            active: true,
        },
    });

    // Link the index to Single Vision.
    await prisma.supplierLensMapping.upsert({
        where: {
            supplier_supplierSku: {
                supplier: "DEMO_SUPPLIER",
                supplierSku: `SV-${item.code}`,
            },
        },
        update: {
            lensTypeId: singleVision.id,
            lensIndexId: index.id,
            active: true,
        },
        create: {
            supplier: "DEMO_SUPPLIER",
            supplierSku: `SV-${item.code}`,
            lensTypeId: singleVision.id,
            lensIndexId: index.id,
            active: true,
        },
    });

    // Add a price associated with this lens type and index.
    await prisma.lensPrice.upsert({
        where: { code: `price_sv_${item.code}_usd` },
        update: {
            amountMinor: item.price,
            currencyCode: "USD",
            kind: "base",
            active: true,
            lensTypeId: singleVision.id,
            lensIndexId: index.id,
        },
        create: {
            code: `price_sv_${item.code}_usd`,
            amountMinor: item.price,
            currencyCode: "USD",
            kind: "base",
            active: true,
            lensTypeId: singleVision.id,
            lensIndexId: index.id,
        },
    });
}