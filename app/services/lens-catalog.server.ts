import prisma from "../db.server";

const priceFields = {
    code: true,
    kind: true,
    amountMinor: true,
    currencyCode: true,
};

const getLensTypes = (currencyCode: string) => {
    return prisma.lensType.findMany({
        where: { active: true },
        select: {
            code: true,
            name: true,
            family: true,
            description: true,
            prices: {
                where: { active: true, currencyCode },
                select: { ...priceFields, lensIndex: { select: { code: true } } },
            },
        },
    });
}

const getLensIndices = (currencyCode: string) => {
    return prisma.lensIndex.findMany({
        where: { active: true },
        select: {
            code: true,
            displayName: true,
            refractiveIndex: true,

            supplierMappings: {
                where: { active: true },
                select: {
                    lensType: {
                        select: {
                            code: true
                        }
                    }
                }
            },

            prices: {
                where: {
                    active: true,
                    currencyCode,
                },
                select: {
                    code: true,
                    kind: true,
                    amountMinor: true,
                    currencyCode: true,
                    lensType: {
                        select: { code: true }
                    }
                },
                orderBy: { amountMinor: "asc" }
            }
        },
        orderBy: { refractiveIndex: "asc" }
    });
}

const getLensOptions = (currencyCode: string) => {
    return prisma.lensOption.findMany({
        where: { active: true },
        select: {
            code: true,
            name: true,
            category: true,
            prices: {
                where: { active: true, currencyCode },
                select: priceFields,
            },
        },
    });
}

const getRules = () => {
    return prisma.lensCompatibilityRule.findMany({
        where: { active: true },
        select: {
            code: true,
            kind: true,
            lensType: { select: { code: true } },
            lensIndex: { select: { code: true } },
            lensOption: { select: { code: true } },
            relatedOptionCode: true,
            limitValue: true,
            minimumFrameHeightMm: true,
            message: true,
        },
    });
}

export const loadLensCatalog = async (currencyCode: string) => {
    const [lensTypes, lensIndices, lensOptions, rules] = await Promise.all([
        getLensTypes(currencyCode),
        getLensIndices(currencyCode),
        getLensOptions(currencyCode),
        getRules(),
    ]);

    return { lensTypes, lensIndices, lensOptions, rules };
}
