import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import LensTypeSelector from "app/components/LensTypeSelector";
import TrustBenefits from "app/components/TrustBenefits";
import PrescriptionForm, { type PrescriptionData } from "app/components/PrescriptionForm";
import SelectedFrame from "app/components/SelectedFrame";

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
    catalog: {
      lensTypes: catalog.lensTypes,
      lensOptions: catalog.lensOptions
    },
  };
}

export default function HomePage() {
  const { product } = useLoaderData<typeof loader>();

  const [step, setStep] = useState<1 | 2>(1);
  const [prescriptionValues, setPrescriptionValues] =
    useState<PrescriptionData | undefined>();
  const [prescriptionErrors, setPrescriptionErrors] = useState<string[]>(
    [],
  );

  const handlePrescriptionContinue = (values: PrescriptionData) => {
    const toNumber = (value: string) =>
      value.trim() === "" ? undefined : Number(value);

    const prescription: Prescription = {
      right: {
        sph: toNumber(values.rightSph),
        cyl: toNumber(values.rightCyl),
        axis: toNumber(values.rightAxis),
      },
      left: {
        sph: toNumber(values.leftSph),
        cyl: toNumber(values.leftCyl),
        axis: toNumber(values.leftAxis),
      },
      pd: {
        single: toNumber(values.pd),
      },
    };

    const result = validatePrescription(prescription);

    if (!result.valid) {
      setPrescriptionErrors(result.errors);
      return;
    }

    setPrescriptionValues(values);
    setPrescriptionErrors([]);
  };

  return (
    <main className="w-full bg-white font-sans">
      <SelectedFrame
        variantTitle={product.variantTitle}
        image={product.image}
      />

      <section className="border-b border-slate-200 px-5 py-5 md:px-12">
        <div className="w-full">
          <p className="text-sm font-semibold text-slate-500">
            STEP {step} OF 2
          </p>

          <div className="mt-3 flex gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-slate-900" : "bg-slate-200"
                }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-slate-900" : "bg-slate-200"
                }`}
            />
          </div>
        </div>
      </section>

      <div className="w-full">
        {step === 1 && (
          <LensTypeSelector
            onSelectLensType={(lensType) => {
              if (lensType !== "single_vision") {
                return;
              }

              setPrescriptionErrors([]);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <PrescriptionForm
            lensIndexName="Single Vision"
            refractiveIndex={1.5}
            initialValues={prescriptionValues}
            errors={prescriptionErrors}
            onBack={() => {
              setPrescriptionErrors([]);
              setStep(1);
            }}
            onContinue={handlePrescriptionContinue}
          />
        )}
      </div>

      <TrustBenefits />
    </main>
  );
}