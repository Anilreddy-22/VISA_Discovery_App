import { CheckCircle2, LayoutDashboard, Settings2, BarChart3, LineChart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type BreadcrumbStep = {
  id: number;
  label: string;
  icon: React.ReactNode;
};

const steps: BreadcrumbStep[] = [
  { id: 1, label: "OVERVIEW", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 2, label: "DIAGNOSIS", icon: <Settings2 className="w-4 h-4" /> },
  { id: 3, label: "STRATEGY", icon: <BarChart3 className="w-4 h-4" /> },
  { id: 4, label: "SIMULATION", icon: <LineChart className="w-4 h-4" /> },
  { id: 5, label: "OUTCOME", icon: <FileText className="w-4 h-4" /> }
];

export function Breadcrumbs({ currentStep, onStepClick }: { currentStep: number, onStepClick?: (stepId: number) => void }) {
  return (
    <div className="w-full bg-gray-50 border-b border-gray-200 py-6">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2 -z-10" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[var(--color-buyframe-red)] -translate-y-1/2 transition-all duration-500 -z-10"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {/* Steps */}
          {steps.map((step, index) => {
            const isComplete = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isFuture = step.id > currentStep;
            
            return (
              <button 
                key={step.id} 
                className="flex flex-col items-center gap-2 relative cursor-pointer hover:opacity-80 transition-opacity disabled:cursor-not-allowed disabled:opacity-100"
                onClick={() => onStepClick?.(step.id)}
                disabled={isFuture}
              >
                {/* Circle */}
                <div 
                  className={cn(
                    "w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-300 bg-white",
                    isComplete && "bg-[var(--color-buyframe-red)] border-[var(--color-buyframe-red)] text-white",
                    isActive && "bg-[var(--color-buyframe-red)] border-[var(--color-buyframe-red)] text-white scale-110",
                    isFuture && "border-gray-300 text-gray-400"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                
                {/* Label */}
                <div 
                  className={cn(
                    "text-xs font-bold tracking-wider whitespace-nowrap transition-colors",
                    (isComplete || isActive) && "text-black",
                    isFuture && "text-gray-400"
                  )}
                >
                  {step.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
