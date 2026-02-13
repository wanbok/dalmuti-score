"use client";

interface Step {
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-4" role="navigation" aria-label="진행 단계">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <div key={index} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-text-inverse shadow-sm shadow-primary/25"
                    : isCompleted
                      ? "bg-success text-text-inverse"
                      : "bg-surface-sunken text-text-tertiary"
                }`}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-primary-text"
                    : isCompleted
                      ? "text-success-text"
                      : "text-text-tertiary"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-6 shrink-0 rounded-full transition-colors duration-200 ${
                  isCompleted ? "bg-success" : "bg-border-light"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
