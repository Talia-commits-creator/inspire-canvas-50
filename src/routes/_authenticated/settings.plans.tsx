import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Shield, CheckCircle2, ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanCard } from "@/components/premium/plan-card";
import { useMySubscription, useSubscriptionPlans } from "@/hooks/use-premium";
import { SUBSCRIPTION_STATUS_LABELS } from "@/lib/premium";

export const Route = createFileRoute("/_authenticated/settings/plans")({
  head: () => ({
    meta: [
      { title: "Subscription & Plans — Inspire to Aspire" },
      {
        name: "description",
        content: "Manage your membership plan and explore available entitlements.",
      },
    ],
  }),
  component: PlansSettingsPage,
});

function PlansSettingsPage() {
  const mySubQuery = useMySubscription();
  const plansQuery = useSubscriptionPlans();

  const sub = mySubQuery.data;
  const plans = plansQuery.data ?? [];
  const currentPlan = sub?.plan;
  const isPro = currentPlan?.slug === "creator_pro";

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Settings"
        title="Subscription & Plans"
        description="View your active membership tier, features, and explore upgrade options."
        actions={
          <Link to="/pricing">
            <Button variant="outline" className="gap-1.5">
              Public Pricing
              <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
        {/* Current Subscription Card */}
        {mySubQuery.isLoading ? (
          <Skeleton className="h-44 w-full rounded-2xl" />
        ) : (
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-display text-xl font-bold">
                      {currentPlan?.name ?? "Free Community"}
                    </CardTitle>
                    <Badge
                      variant={isPro ? "default" : "secondary"}
                      className="capitalize font-medium text-xs"
                    >
                      {SUBSCRIPTION_STATUS_LABELS[sub?.status ?? "active"]}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    Your current membership tier on Inspire to Aspire.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Billing provider:</span>
                  <Badge variant="outline" className="text-xs font-normal">
                    Unconfigured (Preview)
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl border border-border/60 p-3.5 bg-background space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Portfolio Capacity</p>
                  <p className="font-display text-lg font-semibold">
                    {isPro ? "60 works (Expanded)" : "6 works (Standard)"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 p-3.5 bg-background space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Active Services</p>
                  <p className="font-display text-lg font-semibold">
                    {isPro ? "50 listings" : "3 listings"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 p-3.5 bg-background space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Verified Presence</p>
                  <p className="font-display text-lg font-semibold flex items-center gap-1.5">
                    {isPro ? (
                      <>
                        <Sparkles className="size-4 text-primary" />
                        Verified Pro
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-4 text-muted-foreground" />
                        Community Member
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans Section */}
        <div className="space-y-6 pt-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold tracking-tight">Available Plans</h2>
            <p className="text-sm text-muted-foreground">
              Upgrade your creator or organization capabilities with enhanced visibility and tools.
            </p>
          </div>

          {plansQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-80 w-full rounded-2xl" />
              <Skeleton className="h-80 w-full rounded-2xl" />
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={plan.slug === (currentPlan?.slug ?? "free")}
                  highlighted={plan.slug === "creator_pro"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
