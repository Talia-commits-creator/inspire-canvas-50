import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Info, Sparkles, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { PlanCard } from "@/components/premium/plan-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSubscriptionPlans, useMySubscription } from "@/hooks/use-premium";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — Inspire to Aspire" },
      {
        name: "description",
        content: "Explore subscription plans for creators and organizations on Inspire to Aspire.",
      },
      { property: "og:title", content: "Plans & Pricing — Inspire to Aspire" },
      {
        property: "og:description",
        content:
          "Transparent, accessible tiers designed to connect talent and empower communities.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [filter, setFilter] = useState<"all" | "user" | "organization">("all");
  const plansQuery = useSubscriptionPlans();
  const mySubQuery = useMySubscription();

  const plans = plansQuery.data ?? [];
  const currentPlanSlug = mySubQuery.data?.plan.slug ?? "free";

  const filteredPlans = plans.filter((plan) => {
    if (filter === "all") return true;
    return plan.target_entity === filter;
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Membership & Tiers"
        title="Simple, transparent plans for every stage"
        description="Whether you are starting your creative journey or running an established organization, Inspire to Aspire gives you the tools to create, collaborate, and grow."
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-12">
        {/* Environment Readiness Notice */}
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="size-5 text-primary" />
          <AlertTitle className="font-semibold text-foreground">
            Platform Preview: Core Features are Free
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground mt-1">
            Inspire to Aspire is currently in its preview foundation stage. Profiles, service
            listings, community participation, and bookings are completely free. Production billing
            provider integration is in progress and will enable seamless automated upgrades in an
            upcoming phase.
          </AlertDescription>
        </Alert>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="rounded-full px-5"
          >
            All Plans
          </Button>
          <Button
            size="sm"
            variant={filter === "user" ? "default" : "outline"}
            onClick={() => setFilter("user")}
            className="rounded-full px-5"
          >
            For Creators
          </Button>
          <Button
            size="sm"
            variant={filter === "organization" ? "default" : "outline"}
            onClick={() => setFilter("organization")}
            className="rounded-full px-5"
          >
            For Organizations
          </Button>
        </div>

        {/* Plans Grid */}
        {plansQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={plan.slug === currentPlanSlug}
                highlighted={plan.slug === "creator_pro"}
              />
            ))}
          </div>
        )}

        {/* Platform Values / Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-border/80 bg-card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">No Hidden Fees</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clear flat monthly pricing. No surprise commission markups on your creative
                services.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="size-5 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Verified Credentials</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Earn verified creator or organization badges to stand out across our directory and
                discovery feed.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Community First</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Free members always retain access to basic profiles, public discovery, and community
                interactions.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about Inspire to Aspire tiers and memberships.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-medium">
                Can I use Inspire to Aspire for free?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Yes! Our Free Community tier lets you create your universal profile, publish a
                creator profile with up to 6 portfolio works, list up to 3 services, receive booking
                requests, and participate in the community feed.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-medium">
                What does Creator Pro include?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Creator Pro unlocks a Verified Creator badge, expands your portfolio capacity to 60
                items, lets you offer up to 50 services, grants priority search visibility, and
                provides access to creator performance metrics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-medium">
                How does Organization Partner work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                Organization Partner is tailored for institutions, agencies, and non-profits. It
                provides a dedicated organization profile, a verified badge, priority listing in the
                organization directory, and access to multi-creator collaboration workspaces.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-medium">
                When will live payment checkout be active?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                We are finishing the database-authoritative entitlement architecture in this phase.
                The payment checkout integration is being prepared and will be connected in an
                upcoming release without disrupting your existing data.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </SiteLayout>
  );
}
