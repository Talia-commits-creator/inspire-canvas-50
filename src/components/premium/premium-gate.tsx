import { ReactNode } from "react";
import { useEntitlement } from "@/hooks/use-premium";
import { UpgradePrompt } from "@/components/premium/upgrade-prompt";
import { Skeleton } from "@/components/ui/skeleton";
import type { PremiumFeatureKey } from "@/lib/premium";

type PremiumGateProps = {
  feature: PremiumFeatureKey | string;
  children: ReactNode;
  fallback?: ReactNode;
  featureTitle?: string;
  featureDescription?: string;
  compactFallback?: boolean;
};

export function PremiumGate({
  feature,
  children,
  fallback,
  featureTitle,
  featureDescription,
  compactFallback = false,
}: PremiumGateProps) {
  const { hasEntitlement, isLoading } = useEntitlement(feature);

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  if (hasEntitlement) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      title={featureTitle ?? "Upgrade to access this feature"}
      description={
        featureDescription ??
        "This feature is available to Creator Pro and Organization Partner members."
      }
      feature={featureTitle}
      compact={compactFallback}
    />
  );
}
