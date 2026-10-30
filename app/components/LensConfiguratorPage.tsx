import { useState } from "react";
import type { LensConfiguratorPageData } from "app/services/lens-configurator-page.server";
import LensTypeSelector from "./LensTypeSelector";
import TrustBenefits from "./TrustBenefits";
import PrescriptionForm, { type PrescriptionData } from "./PrescriptionForm";
import LensTypeConfigurator from "./LensTypeConfigurator";
import SelectedFrame from "./SelectedFrame";
import SingleVisionConfigurator from "./SingleVisionConfigurator";
import ConfigurationReview from "./ConfigurationReview";
import { validatePrescription, type Prescription, } from "app/services/prescription";
import { calculatePrice, PriceError } from "app/services/lens-pricing";
import PrescriptionSelection, { PrescriptionMethod } from "./PrescriptionSelection";
import CoatingReview, { CoatingSelection } from "./CoatingReview";
import LensTechnologySelector, { type LensTechnologyColor, } from "./LensTechnologySelector";

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
    shop,
    currencyCode,
    framePriceMinor,
    product,
    catalog,
    lensIndices,
    lensVariantByMinor,
  } = data;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const [prescriptionValues, setPrescriptionValues] = useState<PrescriptionData | undefined>();
  const [prescriptionErrors, setPrescriptionErrors] = useState<string[]>([]);
  const [selectedVisionTypeCode, setSelectedVisionTypeCode] = useState("single_vision_distance",);
  const [selectedLensIndexCode, setSelectedLensIndexCode] = useState("");
  const [selectedLensIndex, setSelectedLensIndex] = useState<{
    code: string;
    displayName: string;
    refractiveIndex: number;
  } | null>(null);
  const [selectedLensOptionCode, setSelectedLensOptionCode] = useState("clear");
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [priceError, setPriceError] = useState("");
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [prescriptionMethod, setPrescriptionMethod] = useState<PrescriptionMethod | null>(null);
  const [coatingSelection, setCoatingSelection] = useState<CoatingSelection>({
    antiFog: false,
    blueLight: false,
  });

  const [selectedCoatings, setSelectedCoatings] = useState<string[]>([]);

  const [selectedTechnologyCode, setSelectedTechnologyCode] = useState("");
  const [selectedTechnologyColor, setSelectedTechnologyColor] = useState<"GREY" | "AMBER">("GREY");

  const selectedTechnologyName = catalog.lensTechnology.find((technology) => technology.code === selectedTechnologyCode)?.name

  const compatibleIndexCodes =
    selectedLensOptionCode === "light_adaptive" &&
      selectedTechnologyCode
      ? catalog.lensTechnologyIndexCompatibility
        .filter(
          (compatibility) =>
            compatibility.lensTechnology.code === selectedTechnologyCode
        )
        .map((compatibility) => compatibility.lensIndex.code)
      : catalog.lensIndexCompatibilities
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

    setStep(4);
    setPrescriptionValues(values);
    setPrescriptionErrors([]);
  };

  const selectedLensTypeName =
    catalog.lensTypes.find(
      (lensType) => lensType.code === selectedVisionTypeCode,
    )?.name ?? "Single Vision Distance";
  const selectedLensOptionName =
    catalog.lensOptions.find((option) => option.code === selectedLensOptionCode)
      ?.name ?? selectedLensOptionCode;

  const calculateSelectedPrice = (
    lensIndexCode: string,
    optionCodes: string[],
  ) => {
    setIsCalculatingPrice(true);
    setPriceError("");

    try {
      const pricing = calculatePrice(
        catalog,
        {
          lensTypeCode: selectedVisionTypeCode,
          lensIndexCode,
          optionCodes,
        },
        framePriceMinor,
      );

      setPriceResult(pricing);
      setPriceError("");
    } catch (error) {
      setPriceError(
        error instanceof Error ? error.message : "Unable to calculate price.",
      );
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const lensTypesWithPrices = catalog.lensTypes.map((lensType) => {
    const basePrice = lensType.prices.find((price) => !price.lensIndex);

    return {
      ...lensType,
      startingPrice: basePrice?.amountMinor ?? null,
    };
  });

  return (
    <main className="w-full bg-white font-sans">
      <SelectedFrame
        variantTitle={product.variantTitle}
        image={product.image}
      />

      <section className="border-b border-slate-200 px-5 py-5 md:px-12">
        <div className="w-full">
          <p className="text-sm font-semibold text-slate-500">
            STEP {step} OF 8
          </p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((progressStep) => (
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
            selectedLensTypeCode={selectedVisionTypeCode}
            lensTypes={lensTypesWithPrices}
            onSelectLensType={(lensType) => {
              if (lensType !== "single_vision_distance" && lensType !== "single_vision_reading") return;
              setSelectedVisionTypeCode(lensType);
              setSelectedLensIndex(null);
              setSelectedLensIndexCode("")
              setPriceResult(null)
              setPriceError("")
              setPrescriptionErrors([]);
            }}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <PrescriptionSelection
            onBack={() => setStep(1)}
            onContinue={(method) => {
              setPrescriptionMethod(method)

              if (method === "manual") {
                setStep(3);
              }
            }}
          />
        )}

        {step === 3 && (
          <PrescriptionForm
            lensIndexName={selectedLensTypeName}
            refractiveIndex={
              lensIndices.find((index) => index.code === selectedLensIndexCode)
                ?.refractiveIndex ?? null
            }
            initialValues={prescriptionValues}
            errors={prescriptionErrors}
            onBack={() => {
              setPrescriptionErrors([]);
              setStep(2);
            }}
            onContinue={handlePrescriptionContinue}
          />
        )}

        {step === 4 && (
          <LensTypeConfigurator
            lensOptions={catalog.lensOptions.filter(
              (option): option is typeof option & { category: "lens_type" } => option.category === "lens_type",
            )}
            onBack={() => setStep(3)}
            onContinue={(lensOptionCode) => {
              setSelectedLensOptionCode(lensOptionCode);
              setSelectedLensIndex(null);

              const defaultIndex = lensIndices.find((index) => compatibleIndexCodes.includes(index.code) && Number(index.refractiveIndex) === 1.5)

              setSelectedLensIndexCode(defaultIndex?.code ?? "");

              if (lensOptionCode === 'light_adaptive') {
                setStep(5)
              }
              else {
                setSelectedTechnologyCode("")
                setSelectedTechnologyColor("GREY")
                setStep(6)
              }
            }}
            initialValue={selectedLensOptionCode}
          />
        )}

        {step === 5 && selectedLensOptionCode === 'light_adaptive' && (
          <LensTechnologySelector
            technologies={catalog.lensTechnology}
            selectedTechnologyCode={selectedTechnologyCode}
            selectedColor={selectedTechnologyColor}
            onSelectTechnology={setSelectedTechnologyCode}
            onSelectColor={setSelectedTechnologyColor}
            onBack={() => setStep(4)}
            onContinue={() => setStep(6)}
          />
        )}

        {step === 5 && priceError && (
          <p role="alert" className="px-5 text-sm text-red-600 md:px-12">
            {priceError}
          </p>
        )}

        {step === 6 && (
          <SingleVisionConfigurator
            currencyCode={currencyCode}
            lensIndices={lensIndices}
            compatibleIndexCodes={compatibleIndexCodes}
            lensTypeCode={selectedVisionTypeCode}
            lensOptionCode={selectedLensOptionCode}
            onBack={() => {
              if (selectedLensOptionCode === 'light_adaptive') {
                setStep(5)
              }
              else {
                setStep(4)
              }
            }}
            onContinue={(index) => {
              setSelectedLensIndex(index);
              setSelectedLensIndexCode(index.code);
              setStep(7)
            }}
            selectedIndexCode={selectedLensIndexCode}
            onSelectIndex={setSelectedLensIndexCode}
          />
        )}

        {step === 7 && selectedLensIndex && (
          <CoatingReview
            lensOptionCode={selectedLensOptionCode}
            initialSelection={coatingSelection}
            selectedTechnologyCode={selectedTechnologyCode}
            onBack={() => setStep(6)}
            onContinue={(selection) => {
              setCoatingSelection(selection)

              const selected: string[] = [];

              if (selection.antiFog) {
                selected.push("Anti-fog")
              }

              if (selection.blueLight) {
                selected.push("Blue-light coating")
              }

              setSelectedCoatings(selected)

              const optionCodes = [selectedLensOptionCode];

              if (selection.antiFog) {
                optionCodes.push("anti_fog");
              }

              if (selection.blueLight) {
                optionCodes.push("blue_light_coating");
              }


              calculateSelectedPrice(
                selectedLensIndex.code,
                optionCodes,
              )
              setStep(8)
            }}
          />
        )}

        {step === 8 && selectedLensIndex && prescriptionValues && (
          <ConfigurationReview
            shop={shop}
            lensTypeName={selectedLensTypeName}
            lensOptionName={selectedLensOptionName}
            lensIndexName={selectedLensIndex.displayName}
            refractiveIndex={selectedLensIndex.refractiveIndex}
            prescription={prescriptionValues}
            framePriceMinor={framePriceMinor}
            lensVariantId={
              lensVariantByMinor[priceResult?.lensTotalMinor ?? 0] ?? null
            }
            lensTotalMinor={priceResult?.lensTotalMinor ?? 0}
            totalPriceMinor={priceResult?.totalMinor ?? framePriceMinor}
            currencyCode={currencyCode}
            variantId={product.variantId}
            onBack={() => setStep(7)}
            priceItems={priceResult?.items ?? []}
            selectedCoatings={selectedCoatings}
            selectedTechnologyName={selectedTechnologyName ?? ""}
            selectedTechnologyColor={selectedTechnologyColor}
          />
        )}
      </div>
      <TrustBenefits />
    </main>
  );
}
