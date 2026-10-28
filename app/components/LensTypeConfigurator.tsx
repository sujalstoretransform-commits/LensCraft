import { useState } from "react";

type LensOption = {
    code: string;
    name: string;
    description: string | null;
    category: "lens_type";
    prices: {
        code: string;
        kind: string;
        amountMinor: number;
        currencyCode: string;
    }[];
    rules: {
        code: string;
        kind: string;
        message: string;
    }[];
};

type LensTypeConfiguratorProps = {
    lensOptions: LensOption[];
    onBack: () => void;
    onContinue: (lensOptionCode: string) => void;
    initialValue?: string;
};

export default function LensTypeConfigurator({
    lensOptions,
    onBack,
    onContinue,
    initialValue = "clear",
}: LensTypeConfiguratorProps) {
    const [selectedType, setSelectedType] = useState(initialValue);

    return (
        <section className="w-full bg-white px-5 py-8 md:px-12">
            <div className="w-full">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                    ← Back to prescription
                </button>

                <div className="mb-8">
                    <p className="text-sm font-semibold text-blue-600">
                        LENS CONFIGURATION · STEP 4
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        Choose Your Lens Option
                    </h1>

                    <p className="mt-3 text-slate-600">
                        Choose the lens option that best suits your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {lensOptions.map((lens) => {
                        const isSelected = selectedType === lens.code;

                        return (
                            <button
                                key={lens.code}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setSelectedType(lens.code)}
                                className={`relative rounded-xl border p-5 text-left transition ${isSelected
                                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                                    : "border-slate-200 hover:border-slate-400"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        {lens.name}
                                    </h2>

                                    <span
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-slate-300"
                                            }`}
                                    >
                                        {isSelected && (
                                            <span className="text-xs">✓</span>
                                        )}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    {lens.description}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-end border-t border-slate-200 pt-5">
                    <button
                        type="button"
                        onClick={() => onContinue(selectedType)}
                        className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </section>
    );
}