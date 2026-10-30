import { unauthenticated } from "../shopify.server";
import { loadLensCatalog } from "./lens-catalog.server";

const SHOP_REGEX = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

const safeImageUrl = (raw: string | null): string | null => {
  if (!raw) return null;

  try {
    const url = new URL(raw.startsWith("//") ? `https:${raw}` : raw);

    const isShopifyImage =
      url.protocol === "https:" &&
      (url.hostname === "cdn.shopify.com" ||
        url.hostname.endsWith(".myshopify.com") ||
        url.pathname.startsWith("/cdn/shop/"));

    return isShopifyImage ? url.toString() : null;
  } catch {
    return null;
  }
};

export async function loadLensConfiguratorPage(request: Request) {
  const url = new URL(request.url);

  const shop = url.searchParams.get("shop") ?? "";
  if (!SHOP_REGEX.test(shop)) {
    throw new Response("Invalid shop", { status: 400 });
  }

  const { admin } = await unauthenticated.admin(shop).catch((error) => {
    console.log("No offline session for shop:", shop, error);
    throw new Response("App is not installed on this store", { status: 404 })
  })

  const requestedCurrency = url.searchParams.get("currency")?.toUpperCase();

  const currencyCode =
    requestedCurrency && /^[A-Z]{3}$/.test(requestedCurrency)
      ? requestedCurrency
      : "USD";

  const catalog = await loadLensCatalog(currencyCode);

  const product = {
    productId: url.searchParams.get("productId"),
    variantId: url.searchParams.get("variantId"),
    variantTitle: url.searchParams.get("variantTitle"),
    image: safeImageUrl(url.searchParams.get("image")),
  };

  const rawFramePrice = Number.parseInt(
    url.searchParams.get("framePrice") ?? "",
    10,
  );
  const framePriceMinor = Number.isInteger(rawFramePrice) && rawFramePrice >= 0 ? rawFramePrice : 0;

  const lensIndices = catalog.lensIndices.map((index) => ({
    ...index,
    refractiveIndex: Number(index.refractiveIndex),
  }));

  const lensVariantByMinor: Record<number, string> = {};

  if (admin) {
    const res = await admin.graphql(`#graphql
      query {
        productByIdentifier(identifier: { handle: "lens-upgrade" }) {
          variants(first: 100) {
            nodes { id price }
          }
        }
      }`);

    const json = await res.json();

    for (const v of json.data?.productByHandle?.variants?.nodes ?? []) {
      lensVariantByMinor[Math.round(Number(v.price) * 100)] = v.id
        .split("/")
        .pop()!;
    }
  }

  return {
    shop,
    currencyCode,
    framePriceMinor,
    product,
    lensIndices,
    lensVariantByMinor,
    catalog: {
      lensTypes: catalog.lensTypes,
      lensOptions: catalog.lensOptions,
      lensIndexCompatibilities: catalog.lensIndexCompatibilities,
      lensTechnology: catalog.lensTechnologies,
      lensTechnologyIndexCompatibility: catalog.lensTechnologyIndexCompatibility,
    },
  };
}

export type LensConfiguratorPageData = Awaited<
  ReturnType<typeof loadLensConfiguratorPage>
>;
