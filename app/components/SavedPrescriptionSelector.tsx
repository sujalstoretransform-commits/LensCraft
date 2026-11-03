import { useEffect, useState } from "react";

type SavedPrescription = {
    id: string;
    name: string;
    rightSph: string | null;
    rightCyl: string | null;
    rightAxis: number | null;
    leftSph: string | null;
    leftCyl: string | null;
    leftAxis: number | null;
    pd: string | null;
    prescribedAt: string | null;
    expiresAt: string | null;
};

type Props = {
    proxyPathPrefix: string | null;
    onBack: () => void;
    onSelect: (prescription: SavedPrescription) => void;
    onUseManual: () => void;
};

export default function SavedPrescriptionSelector({
    proxyPathPrefix,
    onBack,
    onSelect,
    onUseManual,
}: Props) {
    const [prescriptions, setPrescriptions] = useState<SavedPrescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadPrescriptions() {
            try {
                if (!proxyPathPrefix?.startsWith("/") || proxyPathPrefix.startsWith("//")) {
                    throw new Error("Saved prescriptions are only available through the Shopify app proxy.");
                }

                const endpoint = new URL(
                    `${proxyPathPrefix}/lens-saved-prescriptions`,
                    window.location.origin,
                );
                const response = await fetch(endpoint, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Unable to load saved prescriptions.");
                }

                const data: unknown = await response.json();

                if (
                    typeof data !== "object" ||
                    data === null ||
                    !("savedPrescriptions" in data) ||
                    !Array.isArray(data.savedPrescriptions)
                ) {
                    throw new Error("Invalid saved prescriptions response.");
                }

                setPrescriptions(data.savedPrescriptions as SavedPrescription[]);
            } catch (err) {
                if (err instanceof Error && err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadPrescriptions();

        return () => controller.abort();
    }, [proxyPathPrefix]);

    return (
        <section className="w-full bg-white px-6 py-6 md:px-12">
            <div className="mb-4">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Choose a saved prescription
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Select a prescription saved to your customer account.
                </p>

                {loading && (
                    <p className="mt-6 text-sm text-slate-500">
                        Loading prescriptions…
                    </p>
                )}

                {error && (
                    <p role="alert" className="mt-6 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {!loading && !error && prescriptions.length === 0 && (
                    <div className="mt-8 rounded-xl border border-slate-200 p-6">
                        <p className="font-medium text-slate-900">
                            No saved prescriptions found
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter your prescription manually to continue.
                        </p>
                        <button
                            type="button"
                            onClick={onUseManual}
                            className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
                        >
                            Enter prescription manually
                        </button>
                    </div>
                )}

                <div className="mt-6 grid gap-4">
                    {prescriptions.map((prescription) => (
                        <button
                            key={prescription.id}
                            type="button"
                            onClick={() => onSelect(prescription)}
                            className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-slate-900"
                        >
                            <span className="font-semibold text-slate-900">
                                {prescription.name}
                            </span>

                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-slate-700">Right eye (OD)</p>
                                    <p className="mt-1 text-slate-600">
                                        SPH: {prescription.rightSph ?? "—"} · CYL:{" "}
                                        {prescription.rightCyl ?? "—"} · Axis:{" "}
                                        {prescription.rightAxis ?? "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium text-slate-700">Left eye (OS)</p>
                                    <p className="mt-1 text-slate-600">
                                        SPH: {prescription.leftSph ?? "—"} · CYL:{" "}
                                        {prescription.leftCyl ?? "—"} · Axis:{" "}
                                        {prescription.leftAxis ?? "—"}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-sm text-slate-500">
                                PD: {prescription.pd ?? "—"}
                            </p>
                            <span className="mt-4 inline-block text-sm font-medium text-slate-900">
                                Use this prescription →
                            </span>
                        </button>
                    ))}
                </div>

                {!loading && prescriptions.length > 0 && (
                    <button
                        type="button"
                        onClick={onUseManual}
                        className="mt-6 text-sm font-medium text-slate-700 underline"
                    >
                        Enter a different prescription manually
                    </button>
                )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    Back
                </button>
            </div>
        </section>
    );
}