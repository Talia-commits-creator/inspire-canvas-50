import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type UpgradePromptProps = {
  title?: string;
  description?: string;
  feature?: string;
  ctaText?: string;
  compact?: boolean;
};

export function UpgradePrompt({
  title = "Unlock Creator Pro",
  description = "Get higher capacity, verified presence, and priority discovery across Inspire to Aspire.",
  feature,
  ctaText = "View plans",
  compact = false,
}: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
          <span>{feature ? `${feature} is available on Pro plans.` : description}</span>
        </div>
        <Link to="/pricing">
          <Button size="sm" variant="outline" className="h-8 shrink-0 text-xs border-primary/30">
            {ctaText}
            <ArrowRight className="ml-1 size-3" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-primary/30 bg-primary/[0.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/pricing">
          <Button size="sm" className="gap-1.5 text-xs font-medium">
            {ctaText}
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
