import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureGateProps {
  feature: "wof_compliance" | "marketing_social" | "website_builder" | "loyalty_program" | "carjam_usage";
  children: ReactNode;
  isEnabled?: boolean;
  fallback?: ReactNode;
  showLock?: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  isEnabled = false, 
  fallback,
  showLock = true 
}: FeatureGateProps) {
  if (isEnabled) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showLock) {
    return null;
  }

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <UpgradePrompt feature={feature} />
      </div>
    </div>
  );
}