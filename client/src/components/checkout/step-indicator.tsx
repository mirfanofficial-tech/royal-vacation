import { checkoutSteps } from "@/lib/checkout-mock-data";

export function StepIndicator({ currentStep = 1 }: { currentStep?: number }) {
  return (
    <ol className="flex items-center">
      {checkoutSteps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isLast = index === checkoutSteps.length - 1;

        return (
          <li key={step.id} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isComplete || isActive
                    ? "bg-navy text-white"
                    : "border border-border bg-white text-muted-foreground"
                }`}
              >
                {stepNumber}
              </span>
              <span
                className={`whitespace-nowrap text-xs font-semibold ${
                  isComplete || isActive ? "text-navy" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={`mx-3 mb-6 h-0.5 flex-1 ${isComplete ? "bg-navy" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
