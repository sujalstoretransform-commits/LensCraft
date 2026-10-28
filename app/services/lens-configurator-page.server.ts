import { authenticate } from "../shopify.server";
import { loadLensCatalog } from "./lens-catalog.server";

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
  const isAppProxy = url.searchParams.has("signature");

  let admin;
  if (isAppProxy) {
    await authenticate.public.appProxy(request);
  } else {
    ({ admin } = await authenticate.admin(request));
  }

  const requestedCurrency = url.searchParams
    .get("currency")
    ?.toUpperCase();

  const currencyCode = requestedCurrency && /^[A-Z]{3}$/.test(requestedCurrency)
    ? requestedCurrency
    : "USD";

  const catalog = await loadLensCatalog(currencyCode);
  const product = {
    productId: url.searchParams.get("productId"),
    variantId: url.searchParams.get("variantId"),
    variantTitle: url.searchParams.get("variantTitle"),
    image: safeImageUrl(url.searchParams.get("image")),
  };

  const rawFramePrice = Number.parseInt(url.searchParams.get("framePrice") ?? "", 10)
  const framePriceMinor = Number.isInteger(rawFramePrice) && rawFramePrice >= 0 ? rawFramePrice : 0

  const lensIndices = catalog.lensIndices.map((index) => ({
    ...index,
    refractiveIndex: Number(index.refractiveIndex),
  }));

  return {
    currencyCode,
    framePriceMinor,
    product,
    lensIndices,
    catalog: {
      lensTypes: catalog.lensTypes,
      lensOptions: catalog.lensOptions,
      lensIndexCompatibilities: catalog.lensIndexCompatibilities,
    },
  };
}

export type LensConfiguratorPageData = Awaited<
  ReturnType<typeof loadLensConfiguratorPage>
>;
