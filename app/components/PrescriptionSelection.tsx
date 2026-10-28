import {
  ClipboardPenLine,
  FileUp,
  History,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

export type PrescriptionMethod =
  | "manual"
  | "upload"
  | "saved"
  | "later";

type PrescriptionSelectionProps = {
  onBack: () => void;
  onContinue: (method: PrescriptionMethod) => void;
};

const prescriptionMethods = [
  {
    id: "manual",
    title: "Fill it out myself",
    description: "Type the numbers from your prescription. About a minute.",
    Icon: ClipboardPenLine,
  },
  {
    id: "upload",
    title: "Upload a photo or PDF",
    description: "Snap a picture — we'll enter it for you.",
    Icon: FileUp,
  },
  {
    id: "saved",
    title: "Use a saved prescription",
    description: "From your last order.",
    Icon: History,
  },
  {
    id: "later",
    title: "Send it later",
    description: "Order now, send it within 14 days.",
    Icon: Clock,
  },
] as const;

export default function PrescriptionSelection({
  onBack,
  onContinue,
}: PrescriptionSelectionProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PrescriptionMethod | null>(null);

  return (
    <section className="w-full bg-white px-4 py-8 sm:px-6">
      <div className="w-full">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">
            PRESCRIPTION
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Add your prescription
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Choose how you would like to provide your prescription.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {prescriptionMethods.map(
            ({ id, title, description, Icon }) => {
              const isSelected = selectedMethod === id;

              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedMethod(id)}
                  className={`group flex min-h-32 items-start gap-4 rounded-xl border p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isSelected
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40"
                    }`}
                >
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg transition ${isSelected
                      ? "bg-blue-100 text-blue-700"
                      : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      }`}
                  >
                    <Icon size={24} strokeWidth={1.8} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">
                        {title}
                      </span>

                      <ArrowRight
                        size={18}
                        className={`shrink-0 transition group-hover:translate-x-1 ${isSelected
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-blue-600"
                          }`}
                      />
                    </span>

                    <span className="mt-2 block text-sm leading-5 text-slate-500">
                      {description}
                    </span>
                  </span>
                </button>
              );
            },
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

          <button
            type="button"
            disabled={!selectedMethod}
            onClick={() => {
              if (selectedMethod) {
                onContinue(selectedMethod);
              }
            }}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}