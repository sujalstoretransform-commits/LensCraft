import { useState } from "react";

import type { LensConfiguratorPageData } from "app/services/lens-configurator-page.server";
import LensTypeSelector from "./LensTypeSelector";
import TrustBenefits from "./TrustBenefits";
import PrescriptionForm, {
  type PrescriptionData,
} from "./PrescriptionForm";
import LensTypeConfigurator from "./LensTypeConfigurator";
import SelectedFrame from "./SelectedFrame";
import SingleVisionConfigurator from "./SingleVisionConfigurator";
import ConfigurationReview from "./ConfigurationReview";
import {
  validatePrescription,
  type Prescription,
} from "app/services/prescription";

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
  const [prescriptionValues, setPrescriptionValues] =
    useState<PrescriptionData | undefined>();
  const [prescriptionErrors, setPrescriptionErrors] = useState<string[]>([]);
  const [selectedVisionTypeCode, setSelectedVisionTypeCode] =
    useState("single_vision_distance");
  const [selectedLensIndexCode, setSelectedLensIndexCode] = useState("");
  const [selectedLensIndex, setSelectedLensIndex] = useState<{
    code: string;
    displayName: string;
    refractiveIndex: number;
  } | null>(null);
  const [selectedLensOptionCode, setSelectedLensOptionCode] =
    useState("clear");

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
                className={`h-1.5 flex-1 rounded-full ${
                  step >= progressStep ? "bg-slate-900" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="w-full">
        {step === 1 && (
          <LensTypeSelector
            lensTypes={catalog.lensTypes}
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
              setStep(5);
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
            lensPriceMinor={5}
            totalPriceMinor={5}
            currencyCode={currencyCode}
            variantId={product.variantId}
            onBack={() => setStep(4)}
          />
        )}
      </div>
      <TrustBenefits />
    </main>
  );
}
