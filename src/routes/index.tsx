import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Sparkles, Users } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/constants/navigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inspire to Aspire — Home" },
      {
        name: "description",
        content:
          "A creative marketplace and media ecosystem for creators, clients, organizations, and audiences.",
      },
      { property: "og:title", content: "Inspire to Aspire — Home" },
      {
        property: "og:description",
        content: "Connecting Talent. Creating Opportunities. Inspiring Communities.",
      },
    ],
  }),
  component: HomePage,
});

const highlights = [
  {
    icon: Sparkles,
    title: "For Creators",
    body: "Portfolios, bookings, collaboration, and monetization built for creative work.",
  },
  {
    icon: Users,
    title: "For Organizations",
    body: "Discover talent, run projects, and manage teams with secure workflows.",
  },
  {
    icon: Compass,
    title: "For Communities",
    body: "A media ecosystem where audiences discover, follow, and support the work they love.",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-subtle)" }}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <Badge variant="secondary" className="mb-5">
              Foundation preview
            </Badge>
            <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              {SITE.tagline.split(".")[0]}.
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                {SITE.tagline.split(".").slice(1).join(".").trim()}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {SITE.name} is a creative marketplace and media ecosystem being built for
              creators, clients, organizations, and audiences. This is the architecture
              foundation — features will roll out in phases.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/discover">
                <Button size="lg">
                  Explore the platform <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              className="aspect-square w-full rounded-3xl"
              style={{
                background: "var(--gradient-hero)",
                boxShadow: "var(--shadow-elegant)",
              }}
            />
            <div className="absolute inset-6 rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-md">
              <div className="grid h-full grid-cols-2 gap-4">
                {highlights.map(({ icon: Icon, title }) => (
                  <div
                    key={title}
                    className="flex flex-col justify-between rounded-xl border border-border/60 bg-background/70 p-4"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="font-display text-sm font-semibold">{title}</p>
                  </div>
                ))}
                <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-background/70 p-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    v0.1
                  </span>
                  <p className="font-display text-sm font-semibold">Foundation ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Built for the long run
          </h2>
          <p className="mt-3 text-muted-foreground">
            A modular architecture designed to scale across roles, marketplaces, media, and
            AI-powered experiences — without rewrites.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-border/60 bg-card p-6 transition-shadow hover:shadow-[var(--shadow-soft)]"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
