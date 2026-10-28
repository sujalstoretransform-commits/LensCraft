import { Check, ShieldCheck } from "lucide-react";
import { useState } from "react";

export type CoatingSelection = {
    antiFog: boolean;
    blueLight: boolean;
};

type CoatingReviewProps = {
    lensOptionCode: string;
    initialSelection?: CoatingSelection;
    onBack: () => void;
    onContinue: (selection: CoatingSelection) => void;
};

const includedCoatings = [
    "Anti-reflective (anti-glare)",
    "Scratch-resistant hard coat",
    "100% UV400 protection",
    "Water- and smudge-repellent easy-clean coating",
];

export default function CoatingReview({
    lensOptionCode,
    initialSelection,
    onBack,
    onContinue,
}: CoatingReviewProps) {
    const [selection, setSelection] = useState<CoatingSelection>(
        initialSelection ?? {
            antiFog: false,
            blueLight: false,
        },
    );

    const isClearLens = lensOptionCode === "clear";

    function toggleOption(option: keyof CoatingSelection) {
        setSelection((current) => ({
            ...current,
            [option]: !current[option],
        }));
    }

    return (
        <section className="w-full bg-white px-5 py-8 md:px-12">
            <div className="w-full">
                <div className="mb-8">
                    <p className="mb-2 text-sm font-semibold text-blue-600">
                        LENS CONFIGURATION
                    </p>

                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        Coating &amp; Review
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                        Every pair includes essential protective coatings. Choose any
                        optional add-ons you need.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-lg bg-green-50 text-green-700">
                                <ShieldCheck size={24} />
                            </span>

                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    Included with every pair
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    No additional selection required
                                </p>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {includedCoatings.map((coating) => (
                                <li key={coating} className="flex items-start gap-3">
                                    <Check
                                        size={18}
                                        className="mt-0.5 shrink-0 text-green-600"
                                        aria-hidden="true"
                                    />
                                    <span className="text-sm leading-6 text-slate-700">
                                        {coating}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-5 sm:p-6">
                        <h3 className="font-semibold text-slate-900">
                            Optional add-ons
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Select any additional coatings you want.
                        </p>

                        <div className="mt-5 space-y-4">
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30">
                                <input
                                    type="checkbox"
                                    checked={selection.antiFog}
                                    onChange={() => toggleOption("antiFog")}
                                    className="mt-1 size-4 accent-blue-600"
                                />

                                <span className="min-w-0">
                                    <span className="block font-medium text-slate-800">
                                        Anti-fog coating
                                    </span>
                                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                                        Helps prevent fogging in cold weather, while wearing
                                        masks, and in kitchens. Activator cloth included.
                                    </span>
                                </span>
                            </label>

                            {isClearLens && (
                                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30">
                                    <input
                                        type="checkbox"
                                        checked={selection.blueLight}
                                        onChange={() => toggleOption("blueLight")}
                                        className="mt-1 size-4 accent-blue-600"
                                    />

                                    <span className="min-w-0">
                                        <span className="block font-medium text-slate-800">
                                            Blue-light coating
                                        </span>
                                        <span className="mt-1 block text-sm leading-5 text-slate-500">
                                            Adds a blue-light filter to clear lenses.
                                        </span>
                                    </span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={onBack}
                        className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        Back
                    </button>

                    <button
                        type="button"
                        onClick={() => onContinue(selection)}
                        className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </section>
    );
}