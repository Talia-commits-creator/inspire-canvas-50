import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { SITE } from "@/constants/navigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inspire to Aspire — A home for creative work" },
      {
        name: "description",
        content:
          "A creative marketplace and media ecosystem where creators, clients, organizations, and audiences discover each other, collaborate, and grow.",
      },
      { property: "og:title", content: "Inspire to Aspire — A home for creative work" },
      {
        property: "og:description",
        content: "Connecting Talent. Creating Opportunities. Inspiring Communities.",
      },
    ],
  }),
  component: HomePage,
});

const audiences = [
  {
    label: "Creators",
    title: "Show the work, get the work",
    body: "Musicians, DJs, MCs, podcasters, photographers, videographers and editors — one profile for your portfolio, bookings and collaborations.",
    to: "/creators",
    cta: "For creators",
  },
  {
    label: "Clients & organizations",
    title: "Find the right talent, faster",
    body: "Universities, labels, venues, studios and brands can search verified creators, brief projects and manage delivery in one place.",
    to: "/organizations",
    cta: "For organizations",
  },
  {
    label: "Communities",
    title: "Discover, follow, support",
    body: "A media ecosystem where audiences find new voices, follow their work and back the projects they believe in.",
    to: "/community",
    cta: "For communities",
  },
] as const;

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:grid lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              A creative ecosystem
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Connecting talent.
              <br />
              Creating opportunities.
              <br />
              <span className="text-primary">Inspiring communities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {SITE.name} is where creative people are found, hired and supported — and
              where the people who need creative work go to find it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/discover" className="sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore the platform
                </Button>
              </Link>
              <Link to="/creators" className="sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  I'm a creator
                </Button>
              </Link>
            </div>
          </div>

          {/* Photography placeholder — replace with authentic imagery */}
          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <figure className="overflow-hidden rounded-xl border border-border">
              <div
                className="photo-placeholder aspect-[4/3] w-full lg:aspect-[3/4]"
                role="img"
                aria-label="Placeholder for photography of creators at work"
              />
              <figcaption className="border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground">
                Image placeholder — creators, studios and events
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Built for the people who make things happen
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            One platform, three perspectives — designed to scale across profiles,
            marketplace, projects, media and community.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {audiences.map((item) => (
            <article
              key={item.label}
              className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
              <Link
                to={item.to}
                className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline sm:min-h-0"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Closing statement */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Creative work deserves a fair place to happen
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We're building {SITE.name} in the open, phase by phase — starting with the
            people, not the features.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Join the platform
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                Read our mission
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
