interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Upload Resume" },
  { number: 2, label: "Job Description" },
  { number: 3, label: "AI Analysis" },
  { number: 4, label: "Download" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step.number <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`ml-2 text-sm font-medium transition-colors ${
                  step.number <= currentStep
                    ? "text-primary"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-px mx-4 transition-colors ${
                  step.number < currentStep
                    ? "bg-primary"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
