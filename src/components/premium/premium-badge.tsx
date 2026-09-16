import { Sparkles, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PremiumBadgeProps = {
  tier?: "creator_pro" | "organization_pro" | "pro";
  className?: string;
  showIcon?: boolean;
};

export function PremiumBadge({ tier = "pro", className = "", showIcon = true }: PremiumBadgeProps) {
  const isOrg = tier === "organization_pro";

  return (
    <Badge
      variant="secondary"
      className={`inline-flex items-center gap-1 border border-primary/20 bg-primary/10 text-primary font-medium text-xs shadow-none hover:bg-primary/15 ${className}`}
    >
      {showIcon ? (
        isOrg ? (
          <ShieldCheck className="size-3" aria-hidden />
        ) : (
          <Sparkles className="size-3" aria-hidden />
        )
      ) : null}
      <span>{isOrg ? "Partner" : "PRO"}</span>
    </Badge>
  );
}
