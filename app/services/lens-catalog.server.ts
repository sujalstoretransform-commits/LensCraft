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
                    currencyCode: currencyCode,
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
        where: {
            active: true,
            category: {
                in: ["add_on", "lens_type"]
            }
        },
        select: {
            code: true,
            name: true,
            category: true,
            description: true,
            prices: {
                where: {
                    active: true,
                    currencyCode,
                },
                select: priceFields,
            },
            rules: {
                where: {
                    active: true,
                },
                select: {
                    code: true,
                    kind: true,
                    message: true,
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
};

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

const getLensIndexCompatibilities = () => {
    return prisma.lensIndexCompatibility.findMany({
        where: {
            active: true,
            lensType: { active: true },
            lensOption: { active: true },
            lensIndex: { active: true },
        },
        select: {
            lensType: { select: { code: true } },
            lensOption: { select: { code: true } },
            lensIndex: { select: { code: true } },
        },
    });
}

export const loadLensCatalog = async (currencyCode: string) => {
    const [lensTypes, lensIndices, lensOptions, rules, lensIndexCompatibilities] = await Promise.all([
        getLensTypes(currencyCode),
        getLensIndices(currencyCode),
        getLensOptions(currencyCode),
        getRules(),
        getLensIndexCompatibilities(),
    ]);

    return { lensTypes, lensIndices, lensOptions, rules, lensIndexCompatibilities };
}
