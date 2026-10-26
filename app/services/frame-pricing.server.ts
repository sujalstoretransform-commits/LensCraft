import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

const VARIANT_PRICE_QUERY = `#graphql
  query VariantPrice($id: ID!) {
    productVariant(id: $id) {
      id
      price
      product {
        title
      }
    }
  }
`;

export const getFramePriceMinor = async (
    admin: AdminApiContext,
    variantId: string,
) => {
    const response = await admin.graphql(VARIANT_PRICE_QUERY, {
        variables: { id: variantId }
    })

    const result = await response.json()
    const price = result.data?.productVariant?.price

    if (price == null || !Number.isFinite(Number(price))) {
        throw new Error("Unable to fetch the selected frame price.");
    }

    return Math.round(Number(price) * 100);
}