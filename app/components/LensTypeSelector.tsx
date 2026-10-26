import { useState } from "react";
import singleVisionPhoto from '../assets/single_vision_lens.png'
import bifocalPhoto from "../assets/bifocal_lens.png"
import progressivePhoto from '../assets/progressive_lens.png'
import speciallityPhoto from '../assets/speciallity_lens.png'

type LensTypeSelectorProps = {
    onSelectLensType: (lensTypeCode: string) => void
}

const lensTypes = [
    {
        id: "single_vision",
        name: "Single Vision",
        description: "One field of vision.\nIdeal for everyday use.",
        icon: { src: singleVisionPhoto },
    },
    {
        id: "bifocal",
        name: "Bifocal",
        description: "Two fields of vision.\nNear and distance.",
        icon: { src: bifocalPhoto },
    },
    {
        id: "progressive",
        name: "Progressive",
        description: "Multiple fields of vision.\nSmooth transition.",
        icon: { src: progressivePhoto },
    },
    {
        id: "specialty",
        name: "Specialty Lenses",
        description: "Blue light, photochromic,\ntinted and more.",
        icon: { src: speciallityPhoto },
    },
];

export default function LensTypeSelector({ onSelectLensType }: LensTypeSelectorProps) {
    const [selected, setSelected] = useState("single_vision");

    return (
        <section className="w-full mt-9 bg-white px-6 py-6 md:px-12">
            <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Select Lens Type
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Choose the type of lenses that best fits your vision needs.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {lensTypes.map((lens) => {
                    const isSelected = selected === lens.id;

                    return (
                        <button
                            key={lens.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                                setSelected(lens.id)
                                onSelectLensType(lens.id)
                            }}
                            className={`relative flex min-h-48 flex-col items-start rounded-lg border p-5 text-left transition-colors ${isSelected
                                ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                                }`}
                        >
                            {isSelected && (
                                <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                                    ✓
                                </span>
                            )}

                            <span className="mb-3 flex size-14  items-center justify-center rounded-xl bg-blue-50 text-4xl font-light text-blue-300">
                                <img
                                    src={lens.icon.src}
                                    alt=""
                                    className="size-full rounded-xl object-contain"
                                />

                            </span>

                            <span className="text-sm font-bold text-slate-900">
                                {lens.name}
                            </span>

                            <span className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-500">
                                {lens.description}
                            </span>

                            <span
                                className={`mt-auto pt-4 text-lg ${isSelected ? "text-blue-500" : "text-slate-500"
                                    }`}
                                aria-hidden="true"
                            >
                                →
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
