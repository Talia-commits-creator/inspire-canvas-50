import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  UsersRound,
  Sparkles,
  BookOpenText,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — DAREY CREATIVES" },
      {
        name: "description",
        content: "Find creators, organizations, services, and community across DAREY CREATIVES.",
      },
      { property: "og:title", content: "Discover — DAREY CREATIVES" },
      { property: "og:description", content: "Explore talent, work, and creative communities." },
    ],
  }),
  component: DiscoverPage,
});

const destinations = [
  {
    title: "Creators",
    subtitle: "People and creative practices",
    copy: "Browse public profiles and discover a range of creative disciplines.",
    to: "/creators",
    icon: Sparkles,
    tone: "surface-warm",
  },
  {
    title: "Organizations",
    subtitle: "Studios, institutions and groups",
    copy: "Explore organizations building opportunities and creative spaces.",
    to: "/organizations",
    icon: Building2,
    tone: "surface-teal",
  },
  {
    title: "Projects & work",
    subtitle: "Ideas and opportunities",
    copy: "See how the platform brings briefs, services and collaborations together.",
    to: "/projects",
    icon: BriefcaseBusiness,
    tone: "bg-secondary/70",
  },
  {
    title: "Community",
    subtitle: "Updates from the ecosystem",
    copy: "Read public posts and share your own update when you join.",
    to: "/community",
    icon: UsersRound,
    tone: "bg-secondary/70",
  },
];

function DiscoverPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Discover"
        title="Find your next creative connection"
        description="Start with the people, organizations and ideas that bring creative work to life."
        actions={
          <Link to="/creators">
            <Button>
              Browse creators <ArrowRight aria-hidden />
            </Button>
          </Link>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {destinations.map(({ icon: Icon, ...item }) => (
            <Link
              key={item.title}
              to={item.to}
              className={`creative-card group flex min-h-60 flex-col rounded-3xl border border-border/70 p-6 sm:p-8 ${item.tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-background/80 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <ArrowRight
                  className="mt-2 size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  aria-hidden
                />
              </div>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.subtitle}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {item.copy}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-5 rounded-3xl border border-border/70 bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpenText className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Curious about the platform?</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Learn how creator profiles, services, bookings and shared workspaces fit together.
              </p>
            </div>
          </div>
          <Link to="/about">
            <Button variant="outline">How it works</Button>
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
