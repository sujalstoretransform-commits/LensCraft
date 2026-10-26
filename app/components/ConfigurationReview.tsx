import type { PrescriptionData } from "./PrescriptionForm";

type ConfigurationReviewProps = {
    lensTypeName: string;
    lensIndexName: string;
    refractiveIndex: number;
    prescription: PrescriptionData;
    onBack?: () => void;
    onContinue?: () => void;
    framePriceMinor: number;
    lensPriceMinor: number;
    totalPriceMinor: number;
    currencyCode: string;
    variantId: string | null;
};

export default function ConfigurationReview({
    lensTypeName,
    lensIndexName,
    refractiveIndex,
    prescription,
    onBack,
    onContinue,
    framePriceMinor,
    lensPriceMinor,
    totalPriceMinor,
    currencyCode,
    variantId
}: ConfigurationReviewProps
) {
    const formatPrice = (amountMinor: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode,
        }).format(amountMinor / 100);


    const handleContinueToCart = () => {
        if (!variantId) {
            alert("Frame variant is missing. Please go back and select your frame.");
            return;
        }

        const params = new URLSearchParams({
            id: variantId,
            quantity: "1",
            "properties[Lens Type]": lensTypeName,
            "properties[Lens Index]": lensIndexName,
            "properties[Refractive Index]": String(refractiveIndex),
            "properties[Right SPH]": prescription.rightSph || "0",
            "properties[Right CYL]": prescription.rightCyl || "0",
            "properties[Right Axis]": prescription.rightAxis || "—",
            "properties[Left SPH]": prescription.leftSph || "0",
            "properties[Left CYL]": prescription.leftCyl || "0",
            "properties[Left Axis]": prescription.leftAxis || "—",
            "properties[PD]": prescription.pd || "—",
        });

        window.location.href = `/cart/add?${params.toString()}`;
    };

    return (
        <section className="w-full bg-white px-5 py-8 md:px-12 md:py-10">
            <div className="w-full">
                <div className="mb-8">
                    <p className="text-sm font-medium text-blue-600">
                        Step 4 of 4
                    </p>

                    <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                        Review Your Configuration
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Check your lens selection and prescription before continuing.
                    </p>
                </div>

                <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-2xl text-blue-600">
                                ◉
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-slate-500">Lens type</p>
                                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                    {lensTypeName}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Your selected lens design
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-2xl text-blue-600">
                                ◎
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-slate-500">Lens index</p>
                                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                    {lensIndexName}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Refractive index: {refractiveIndex.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

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
                                    <td className="px-5 py-4 font-medium md:px-6">
                                        Right (OD)
                                    </td>
                                    <td className="px-5 py-4">
                                        {prescription.rightSph || "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        {prescription.rightCyl || "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        {prescription.rightAxis || "—"}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="px-5 py-4 font-medium md:px-6">
                                        Left (OS)
                                    </td>
                                    <td className="px-5 py-4">
                                        {prescription.leftSph || "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        {prescription.leftCyl || "—"}
                                    </td>
                                    <td className="px-5 py-4">
                                        {prescription.leftAxis || "—"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 md:px-6">
                        <p className="text-sm text-slate-500">
                            Pupillary Distance (PD)
                        </p>
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
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-600">Lens price</span>
                            <span className="font-medium text-slate-900">
                                {formatPrice(lensPriceMinor)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base">
                            <span className="font-semibold text-slate-900">
                                Total
                            </span>
                            <span className="font-bold text-slate-900">
                                {formatPrice(totalPriceMinor)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={handleContinueToCart}
                        className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Continue to Cart
                    </button>
                </div>
            </div>
        </section>
    )
}
