import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, CircleCheck, Handshake } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & opportunities — Inspire to Aspire" },
      {
        name: "description",
        content:
          "Explore creative services and learn how booking requests can become collaborations.",
      },
      { property: "og:title", content: "Projects & opportunities — Inspire to Aspire" },
      {
        property: "og:description",
        content: "Find creative services and make the next connection.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Work in motion"
        title="Find the people for your next idea"
        description="Explore creator services, make a booking request, and start a shared workspace when a request is accepted."
        actions={
          <Link to="/creators">
            <Button>
              Explore creators <ArrowRight aria-hidden />
            </Button>
          </Link>
        }
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Find your fit",
              text: "Browse public creator profiles and see the services they choose to offer.",
              icon: BriefcaseBusiness,
              color: "text-coral",
            },
            {
              number: "02",
              title: "Send a request",
              text: "Each service page explains its price and turnaround where those details are available.",
              icon: Handshake,
              color: "text-primary",
            },
            {
              number: "03",
              title: "Make it together",
              text: "When a request is accepted, create a collaboration workspace for the work ahead.",
              icon: CircleCheck,
              color: "text-success",
            },
          ].map(({ icon: Icon, ...step }) => (
            <article
              key={step.number}
              className="creative-card rounded-3xl border border-border/70 bg-card p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-muted-foreground">
                  {step.number}
                </span>
                <Icon className={`size-5 ${step.color}`} aria-hidden />
              </div>
              <h2 className="mt-8 font-display text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-5 rounded-3xl border border-primary/15 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Ready to explore?
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Creative services live on creator profiles.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Open a profile to see current services, pricing terms and the request flow.
              Availability and listings depend on what each creator has published.
            </p>
          </div>
          <Link to="/creators">
            <Button className="shrink-0">Browse creator profiles</Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
