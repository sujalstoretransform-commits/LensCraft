import { useState } from "react";
import type { LensConfiguratorPageData } from "app/services/lens-configurator-page.server";
import LensTypeSelector from "./LensTypeSelector";
import TrustBenefits from "./TrustBenefits";
import PrescriptionForm, { type PrescriptionData, } from "./PrescriptionForm";
import LensTypeConfigurator from "./LensTypeConfigurator";
import SelectedFrame from "./SelectedFrame";
import SingleVisionConfigurator from "./SingleVisionConfigurator";
import ConfigurationReview from "./ConfigurationReview";
import { validatePrescription, type Prescription, } from "app/services/prescription";
import { calculatePrice, PriceError } from "app/services/lens-pricing";

type PriceResult = {
  items: {
    code: string;
    label: string;
    amountMinor: number;
  }[];
  frameMinor: number;
  lensTotalMinor: number;
  totalMinor: number;
};

export default function LensConfiguratorPage({
  data,
}: {
  data: LensConfiguratorPageData;
}) {
  const {
    currencyCode,
    framePriceMinor,
    product,
    catalog,
    lensIndices,
  } = data;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [prescriptionValues, setPrescriptionValues] = useState<PrescriptionData | undefined>();
  const [prescriptionErrors, setPrescriptionErrors] = useState<string[]>([]);
  const [selectedVisionTypeCode, setSelectedVisionTypeCode] = useState("single_vision_distance");
  const [selectedLensIndexCode, setSelectedLensIndexCode] = useState("");
  const [selectedLensIndex, setSelectedLensIndex] = useState<{ code: string; displayName: string; refractiveIndex: number; } | null>(null);
  const [selectedLensOptionCode, setSelectedLensOptionCode] = useState("clear");
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [priceError, setPriceError] = useState("");
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);


  const compatibleIndexCodes = catalog.lensIndexCompatibilities
    .filter(
      (compatibility) =>
        compatibility.lensType.code === selectedVisionTypeCode &&
        compatibility.lensOption.code === selectedLensOptionCode,
    )
    .map((compatibility) => compatibility.lensIndex.code);

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
      pd: { single: toNumber(values.pd) },
    };

    const result = validatePrescription(prescription);
    if (!result.valid) {
      setPrescriptionErrors(result.errors);
      return;
    }

    setPrescriptionValues(values);
    setPrescriptionErrors([]);
    setStep(3);
  };

  const selectedLensTypeName =
    catalog.lensTypes.find(
      (lensType) => lensType.code === selectedVisionTypeCode,
    )?.name ?? "Single Vision Distance";
  const selectedLensOptionName =
    catalog.lensOptions.find(
      (option) => option.code === selectedLensOptionCode,
    )?.name ?? selectedLensOptionCode;



  const calculateSelectedPrice = (lensIndexCode: string) => {
    setIsCalculatingPrice(true)
    setPriceError("")

    try {
      const pricing = calculatePrice(
        catalog,
        {
          lensTypeCode: selectedVisionTypeCode,
          lensIndexCode,
          optionCodes: [selectedLensOptionCode]
        },
        framePriceMinor,
      );

      setPriceResult(pricing)
      setPriceError("")
      setStep(5)
    } catch (error) {
      setPriceError(
        error instanceof Error ? error.message : "Unable to calculate price.",
      );
    } finally {
      setIsCalculatingPrice(false);
    }
  }

  const lensTypesWithPrices = catalog.lensTypes.map((lensType) => {
    const basePrice = lensType.prices.find(
      (price) => !price.lensIndex
    )

    return {
      ...lensType,
      startingPrice: basePrice?.amountMinor ?? null,
    }
  })


  return (
    <main className="w-full bg-white font-sans">
      <SelectedFrame variantTitle={product.variantTitle} image={product.image} />

      <section className="border-b border-slate-200 px-5 py-5 md:px-12">
        <div className="w-full">
          <p className="text-sm font-semibold text-slate-500">
            STEP {step} OF 5
          </p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((progressStep) => (
              <div
                key={progressStep}
                className={`h-1.5 flex-1 rounded-full ${step >= progressStep ? "bg-slate-900" : "bg-slate-200"
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="w-full">
        {step === 1 && (
          <LensTypeSelector
            lensTypes={lensTypesWithPrices}
            onSelectLensType={(lensType) => {
              if (lensType !== "single_vision_distance") return;
              setSelectedVisionTypeCode(lensType);
              setPrescriptionErrors([]);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <PrescriptionForm
            lensIndexName={selectedLensTypeName}
            refractiveIndex={
              lensIndices.find(
                (index) => index.code === selectedLensIndexCode,
              )?.refractiveIndex ?? null
            }
            initialValues={prescriptionValues}
            errors={prescriptionErrors}
            onBack={() => {
              setPrescriptionErrors([]);
              setStep(1);
            }}
            onContinue={handlePrescriptionContinue}
          />
        )}

        {step === 3 && (
          <LensTypeConfigurator
            lensOptions={catalog.lensOptions.filter(
              (option): option is typeof option & {
                category: "lens_type";
              } => option.category === "lens_type",
            )}
            onBack={() => setStep(2)}
            onContinue={(lensOptionCode) => {
              setSelectedLensOptionCode(lensOptionCode);
              setSelectedLensIndex(null);
              setSelectedLensIndexCode("");
              setStep(4);
            }}
            initialValue={selectedLensOptionCode}
          />
        )}

        {step === 4 && priceError && (
          <p role="alert" className="px-5 text-sm text-red-600 md:px-12">{priceError}</p>
        )}

        {step === 4 && (
          <SingleVisionConfigurator
            currencyCode={currencyCode}
            lensIndices={lensIndices}
            compatibleIndexCodes={compatibleIndexCodes}
            lensTypeCode={selectedVisionTypeCode}
            lensOptionCode={selectedLensOptionCode}
            onBack={() => setStep(3)}
            onContinue={(index) => {
              setSelectedLensIndex(index);
              setSelectedLensIndexCode(index.code);
              calculateSelectedPrice(index.code)
            }}
          />
        )}

        {step === 5 && selectedLensIndex && prescriptionValues && (
          <ConfigurationReview
            lensTypeName={selectedLensTypeName}
            lensOptionName={selectedLensOptionName}
            lensIndexName={selectedLensIndex.displayName}
            refractiveIndex={selectedLensIndex.refractiveIndex}
            prescription={prescriptionValues}
            framePriceMinor={framePriceMinor}
            totalPriceMinor={priceResult?.totalMinor ?? framePriceMinor}
            currencyCode={currencyCode}
            variantId={product.variantId}
            onBack={() => setStep(4)}
            priceItems={priceResult?.items ?? []}
          />
        )}
      </div>
      <TrustBenefits />
    </main>
  );
}
