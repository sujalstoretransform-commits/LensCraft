import { useState } from "react";
import type { PrescriptionData } from "./PrescriptionForm";

type ConfigurationReviewProps = {
  lensTypeName: string;
  lensOptionName: string;
  lensIndexName: string;
  refractiveIndex: number;
  prescription: PrescriptionData;
  onBack?: () => void;
  framePriceMinor: number;
  lensVariantId: string | null;
  lensTotalMinor: number;
  totalPriceMinor: number;
  currencyCode: string;
  variantId: string | null;
  priceItems: {
    code: string;
    label: string;
    amountMinor: number;
  }[];
  selectedCoatings: string[];
};

export default function ConfigurationReview({
  lensTypeName,
  lensOptionName,
  lensIndexName,
  refractiveIndex,
  prescription,
  onBack,
  framePriceMinor,
  lensVariantId,
  lensTotalMinor,
  totalPriceMinor,
  currencyCode,
  variantId,
  priceItems,
  selectedCoatings,
}: ConfigurationReviewProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const formatPrice = (amountMinor: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amountMinor / 100);

  const handleContinueToCart = () => {
    if (!variantId) {
      setCartError(
        "Frame variant is missing. Please go back and select your frame.",
      );
      return;
    }

    setIsAddingToCart(true);
    setCartError(null);

    if (lensTotalMinor > 0 && !lensVariantId) {
      setCartError("Lens price is not available. Please contact support.");
      setIsAddingToCart(false);
      return;
    }

    const storefrontOrigin = window.location.origin;
    const groupId = crypto.randomUUID();

    const rxProperties: Record<string, string> = {
      "Lens Type": lensTypeName,
      "Lens Option": lensOptionName,
      "Lens Index": lensIndexName,
      "Refractive Index": String(refractiveIndex),
      "Right SPH": prescription.rightSph || "0",
      "Right CYL": prescription.rightCyl || "0",
      "Right Axis": prescription.rightAxis || "N/A",
      "Left SPH": prescription.leftSph || "0",
      "Left CYL": prescription.leftCyl || "0",
      "Left Axis": prescription.leftAxis || "N/A",
      "Selected Coating": selectedCoatings.length > 0 ? selectedCoatings.join(", ") : "None",
      PD: prescription.pd || "N/A",
    };

    const fields: Record<string, string> = {
      "items[0][id]": variantId,
      "items[0][quantity]": "1",
      "items[0][properties][_lens_group]": groupId,
      return_to: "/cart",
    };

    if (lensTotalMinor > 0 && lensVariantId) {
      fields["items[1][id]"] = lensVariantId;
      fields["items[1][quantity]"] = "1";
      fields["items[1][properties][_lens_group]"] = groupId;
      Object.entries(rxProperties).forEach(([key, value]) => {
        fields[`items[1][properties][${key}]`] = value;
      });
      fields["items[1][properties][Lens]"] =
        `${lensTypeName} / ${lensIndexName}`;
    } else {
      Object.entries(rxProperties).forEach(([key, value]) => {
        fields[`item[0][properties][${key}]`] = value;
      });
    }

    const form = document.createElement("form");
    form.acceptCharset = "UTF-8";
    form.method = "POST";
    form.action = `${storefrontOrigin}/cart/add`;

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <section className="w-full bg-white px-5 py-8 md:px-12">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Review Your Configuration
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Check your lens selection and prescription before continuing.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex min-h-[120px] items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="mt-1 shrink-0 text-xl text-blue-600">◉</div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Lens type</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {lensTypeName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your selected lens design
              </p>
            </div>
          </div>

          <div className="flex min-h-[120px] items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="mt-1 shrink-0 text-xl text-blue-600">◎</div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Lens option</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {lensOptionName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your selected lens feature
              </p>
            </div>
          </div>

          <div className="flex min-h-[120px] items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <div className="mt-1 shrink-0 text-xl text-blue-600">◎</div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Lens index</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {lensIndexName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Refractive index: {refractiveIndex.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {selectedCoatings.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Selected Coatings
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCoatings.map((coating) => (
                <span
                  key={coating}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  {coating}
                </span>
              ))}
            </div>
          </div>
        )}


        <div className="mt-8 w-full overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-4 md:px-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Prescription Details
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] table-fixed text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium md:px-6">Eye</th>
                  <th className="px-5 py-3 font-medium">SPH</th>
                  <th className="px-5 py-3 font-medium">CYL</th>
                  <th className="px-5 py-3 font-medium">Axis</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="px-5 py-4 font-medium md:px-6">Right (OD)</td>
                  <td className="px-5 py-4">{prescription.rightSph || "—"}</td>
                  <td className="px-5 py-4">{prescription.rightCyl || "—"}</td>
                  <td className="px-5 py-4">{prescription.rightAxis || "—"}</td>
                </tr>

                <tr>
                  <td className="px-5 py-4 font-medium md:px-6">Left (OS)</td>
                  <td className="px-5 py-4">{prescription.leftSph || "—"}</td>
                  <td className="px-5 py-4">{prescription.leftCyl || "—"}</td>
                  <td className="px-5 py-4">{prescription.leftAxis || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 md:px-6">
            <p className="text-sm text-slate-500">Pupillary Distance (PD)</p>
            <p className="mt-1 font-semibold text-slate-900">
              {prescription.pd || "—"} mm
            </p>
          </div>
        </div>

        <div className="mt-8 w-full rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Price Summary
          </h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Frame price</span>
              <span className="font-medium text-slate-900">
                {formatPrice(framePriceMinor)}
              </span>
            </div>

            {priceItems.map((item) => (
              <div key={item.code} className="flex justify-between gap-4">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-medium text-slate-900">
                  {formatPrice(item.amountMinor)}
                </span>
              </div>
            ))}

            <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="font-bold text-slate-900">
                {formatPrice(totalPriceMinor)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </button>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {cartError && (
              <p role="alert" className="text-sm text-red-600">
                {cartError}
              </p>
            )}
            <button
              type="button"
              onClick={handleContinueToCart}
              disabled={isAddingToCart}
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              {isAddingToCart ? "Adding to cart…" : "Continue to Cart"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
