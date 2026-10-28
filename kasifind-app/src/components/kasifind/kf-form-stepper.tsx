"use client";

import { Check } from "lucide-react";

export type KfFormStep = {
  id: string;
  label: string;
  shortLabel: string;
};

export const LISTING_FORM_STEPS: KfFormStep[] = [
  { id: "kf-step-business", label: "Basic info", shortLabel: "Info" },
  { id: "kf-step-location", label: "Location", shortLabel: "Map" },
  { id: "kf-step-services", label: "Services", shortLabel: "Services" },
  { id: "kf-step-photos", label: "Photos", shortLabel: "Photos" },
  { id: "kf-step-publish", label: "Publish", shortLabel: "Publish" },
];

type Props = {
  steps: KfFormStep[];
  activeIndex: number;
  onStepClick: (index: number) => void;
};

export function KfFormStepper({ steps, activeIndex, onStepClick }: Props) {
  return (
    <nav className="kf-stepper" aria-label="Listing progress">
      <ol className="kf-stepper-list">
        {steps.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li key={step.id} className="kf-stepper-item">
              <button
                type="button"
                className={`kf-stepper-btn${active ? " kf-stepper-btn--active" : ""}${done ? " kf-stepper-btn--done" : ""}${index > activeIndex ? " kf-stepper-btn--locked" : ""}`}
                onClick={() => onStepClick(index)}
                aria-current={active ? "step" : undefined}
                aria-disabled={index > activeIndex ? true : undefined}
                disabled={index > activeIndex}
              >
                <span className="kf-stepper-dot" aria-hidden>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
                </span>
                <span className="kf-stepper-label">{step.shortLabel}</span>
              </button>
              {index < steps.length - 1 ? (
                <span className="kf-stepper-line" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="kf-stepper-current">
        Step {activeIndex + 1} of {steps.length}:{" "}
        <strong>{steps[activeIndex]?.label}</strong>
      </p>
    </nav>
  );
}
