import { useState } from "react";
import { Check, Sparkles, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type SubscriptionPlan, formatPlanPrice } from "@/lib/premium";

type PlanCardProps = {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  highlighted?: boolean;
};

export function PlanCard({ plan, isCurrentPlan = false, highlighted = false }: PlanCardProps) {
  const [unconfiguredDialogOpen, setUnconfiguredDialogOpen] = useState(false);

  const priceDisplay = formatPlanPrice(plan.price_minor, plan.currency, plan.billing_interval);
  const isFree = plan.price_minor === 0;

  function handleActionClick() {
    if (isCurrentPlan) return;
    setUnconfiguredDialogOpen(true);
  }

  return (
    <>
      <Card
        className={`relative flex flex-col transition-all duration-200 ${
          highlighted
            ? "border-primary shadow-md ring-1 ring-primary/20"
            : "border-border hover:border-border/80"
        }`}
      >
        {highlighted ? (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
              <Sparkles className="mr-1 size-3" />
              Recommended
            </Badge>
          </div>
        ) : null}

        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="font-display text-xl font-bold tracking-tight">
              {plan.name}
            </CardTitle>
            {isCurrentPlan ? (
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/5 text-primary text-xs"
              >
                Current Plan
              </Badge>
            ) : null}
          </div>
          <CardDescription className="min-h-[40px] text-sm leading-relaxed text-muted-foreground">
            {plan.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div className="flex items-baseline gap-1 border-b border-border/60 pb-5">
            <span className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              {priceDisplay}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What's included
            </p>
            <ul className="space-y-2.5 text-sm text-foreground/90">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-3" strokeWidth={2.5} />
                  </div>
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          {isCurrentPlan ? (
            <Button variant="outline" className="w-full cursor-default border-primary/30" disabled>
              Active Plan
            </Button>
          ) : isFree ? (
            <Button variant="outline" className="w-full" onClick={handleActionClick}>
              Default Included
            </Button>
          ) : (
            <Button
              variant={highlighted ? "default" : "outline"}
              className="w-full font-medium"
              onClick={handleActionClick}
            >
              Upgrade to {plan.name}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={unconfiguredDialogOpen} onOpenChange={setUnconfiguredDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="size-5 text-primary" />
              Billing Provider Unconfigured
            </DialogTitle>
            <DialogDescription>
              We are preparing to launch live payments and subscriptions for {plan.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle className="text-sm font-semibold">Payment integration pending</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Live billing checkout is intentionally kept unconfigured in this environment. Once a
                production payment provider is connected, upgrading to {plan.name} will be available
                instantly without interrupting your current account.
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All existing free capabilities (profiles, community, showcase, bookings, and
              collaborations) remain fully accessible without restriction.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setUnconfiguredDialogOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
