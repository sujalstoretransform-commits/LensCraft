import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import LensTypeSelector from "app/components/LensTypeSelector";
import TrustBenefits from "app/components/TrustBenefits";
import SingleVisionConfigurator from "app/components/SingleVisionConfigurator";
import PrescriptionForm, { type PrescriptionData } from "app/components/PrescriptionForm";
import SelectedFrame from "app/components/SelectedFrame";
import ConfigurationReview from "app/components/ConfigurationReview";
import { validatePrescription, type Prescription } from "app/services/prescription"
import { getFramePriceMinor } from "app/services/frame-pricing.server";
import { authenticate } from "../shopify.server";
import { loadLensCatalog } from "../services/lens-catalog.server";

const safeImageUrl = (raw: string | null): string | null => {
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("//") ? `https:${raw}` : raw)
    const isShopifyImage =
      u.protocol === "https:" &&
      (u.hostname === "cdn.shopify.com" ||
        u.hostname.endsWith(".myshopify.com") ||
        u.pathname.startsWith("/cdn/shop/"));
    return isShopifyImage ? u.toString() : null;
  } catch (error) {
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isAppProxy = url.searchParams.has("signature");

  let framePriceMinor = 0;

  if (isAppProxy) {
    await authenticate.public.appProxy(request);
  } else {
    await authenticate.admin(request);
  }

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
    image: safeImageUrl(url.searchParams.get("image"))
  }

  if (!isAppProxy && product.variantId) {
    const { admin } = await authenticate.admin(request);
    framePriceMinor = await getFramePriceMinor(admin, product.variantId);
  }

  return {
    currencyCode,
    framePriceMinor,
    product,
    lensIndices: catalog.lensIndices.map((index) => ({
      ...index,
      refractiveIndex: Number(index.refractiveIndex),
    })),
    catalog: {
      lensTypes: catalog.lensTypes,
      lensOptions: catalog.lensOptions
    },
  };
}

export default function HomePage() {
  const { currencyCode, framePriceMinor, lensIndices, product } = useLoaderData<typeof loader>();

  const [selectedLensType, setSelectedLensType] = useState<string | null>(
    null,
  );

  const [selectedIndex, setSelectedIndex] = useState<{
    code: string;
    displayName: string;
    refractiveIndex: number;
  } | null>(null);

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  const [prescriptionValues, setPrescriptionValues] = useState<PrescriptionData | undefined>(undefined)

  const [prescriptionErrors, setPrescriptionErrors] = useState<string[]>([])

  const [showReview, setShowReview] = useState(false);

  const handlePrescriptionContinue = (values: PrescriptionData) => {
    const toNumber = (value: string) =>
      value.trim() === "" ? undefined : Number(value);

    const rx: Prescription = {
      right: {
        sph: toNumber(values.rightSph),
        cyl: toNumber(values.rightCyl),
        axis: toNumber(values.rightAxis)
      },
      left: {
        sph: toNumber(values.leftSph),
        cyl: toNumber(values.leftCyl),
        axis: toNumber(values.leftAxis)
      },
      pd: {
        single: toNumber(values.pd)
      }
    }

    const result = validatePrescription(rx)

    if (!result.valid) {
      setPrescriptionErrors(result.errors)
      return
    }

    setPrescriptionValues(values);
    setPrescriptionErrors([]);
    setShowPrescriptionForm(false)
    setShowReview(true);
  }


  return (
    <main className="w-full bg-white font-sans">

      <SelectedFrame
        variantTitle={product.variantTitle}
        image={product.image}
      />

      <div className="w-full">
        {showReview && selectedIndex && prescriptionValues ? (
          <ConfigurationReview
            lensTypeName="Single Vision"
            lensIndexName={selectedIndex.displayName}
            refractiveIndex={selectedIndex.refractiveIndex}
            prescription={prescriptionValues}
            currencyCode={currencyCode}
            framePriceMinor={framePriceMinor}
            lensPriceMinor={0}
            totalPriceMinor={framePriceMinor}
            onBack={() => {
              setShowReview(false)
              setShowPrescriptionForm(true)
            }}
            onContinue={() => {
              console.log("Configuration ready for pricing and cart");
            }}
            variantId={product.variantId}
          />
        ) : showPrescriptionForm && selectedIndex ? (
          <PrescriptionForm
            lensIndexName={selectedIndex.displayName}
            refractiveIndex={selectedIndex.refractiveIndex}
            initialValues={prescriptionValues}
            errors={prescriptionErrors}
            onBack={() => setShowPrescriptionForm(false)}
            onContinue={handlePrescriptionContinue}
          />
        ) : selectedLensType === "single_vision" ? (
          <SingleVisionConfigurator
            currencyCode={currencyCode}
            lensIndices={lensIndices}
            onBack={() => {
              setSelectedLensType(null)
              setSelectedIndex(null)
            }}
            onContinue={(index) => {
              setSelectedIndex(index)
              setShowPrescriptionForm(true)
            }}
          />
        ) : (
          <LensTypeSelector onSelectLensType={setSelectedLensType} />
        )}
      </div>

      <TrustBenefits />
    </main>
  );
}
