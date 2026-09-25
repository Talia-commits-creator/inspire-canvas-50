import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Compass,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/constants/navigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inspire to Aspire — A home for creative work" },
      {
        name: "description",
        content:
          "A creative ecosystem where talent is discovered, opportunities take shape, and communities grow.",
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

const pathways = [
  {
    icon: Sparkles,
    eyebrow: "For creators",
    title: "Put your work in motion.",
    text: "Shape a profile around your craft, show your portfolio and make it easier for the right people to find you.",
    to: "/creators",
    link: "Meet the creators",
    tone: "surface-warm",
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: "For opportunity seekers",
    title: "Find people to make it real.",
    text: "Explore creative profiles and services, then send a booking request when you find the right fit.",
    to: "/discover",
    link: "Explore opportunities",
    tone: "surface-teal",
  },
  {
    icon: UsersRound,
    eyebrow: "For communities",
    title: "Make room for more voices.",
    text: "Share work, ideas and opportunities with a community built around creative practice.",
    to: "/community",
    link: "Visit the community",
    tone: "bg-secondary/70",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden border-b border-border/70">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_42%,color-mix(in_oklab,var(--color-gold)_24%,transparent),transparent_34%),radial-gradient(ellipse_at_88%_80%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_38%)]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="reveal-in max-w-2xl">
            <Badge
              variant="outline"
              className="rounded-full border-primary/25 bg-primary/5 px-3 py-1 text-primary"
            >
              A creative ecosystem
            </Badge>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Good work starts when <span className="text-primary">people find each other.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {SITE.name} brings creative people, organizations and opportunities into one welcoming
              place to discover, collaborate and grow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/creators">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore creators <ArrowRight aria-hidden />
                </Button>
              </Link>
              <Link to="/projects">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Find opportunities
                </Button>
              </Link>
            </div>
            <Link
              to="/community"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Join the community <ArrowDownRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[var(--shadow-raised)]">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_24%,color-mix(in_oklab,var(--color-coral)_54%,transparent),transparent_28%),radial-gradient(ellipse_at_72%_36%,color-mix(in_oklab,var(--color-gold)_72%,transparent),transparent_29%),radial-gradient(ellipse_at_70%_86%,color-mix(in_oklab,var(--color-primary)_58%,transparent),transparent_39%),linear-gradient(135deg,var(--color-secondary),var(--color-background))]"
              />
              <div
                aria-hidden
                className="absolute left-[18%] top-[21%] h-[56%] w-[48%] rotate-[-9deg] rounded-[44%_56%_61%_39%/44%_39%_61%_56%] border border-white/35 bg-white/20 backdrop-blur-sm"
              />
              <div
                aria-hidden
                className="absolute bottom-[13%] right-[15%] h-[47%] w-[40%] rotate-[12deg] rounded-[56%_44%_42%_58%/54%_48%_52%_46%] border border-white/35 bg-primary/20 backdrop-blur-sm"
              />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 rounded-2xl border border-white/30 bg-background/75 p-4 backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Talent · Opportunity · Community
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold sm:text-xl">
                    Make something meaningful.
                  </p>
                </div>
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <Sparkles className="size-5" />
                </span>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              A place for real creative work and the people behind it.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Find your way in
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              One ecosystem. Many ways to grow.
            </h2>
          </div>
          <Link
            to="/discover"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Compass className="size-4" aria-hidden /> Explore the platform
          </Link>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {pathways.map(({ icon: Icon, ...item }) => (
            <article
              key={item.eyebrow}
              className={`creative-card flex min-h-64 flex-col rounded-3xl border border-border/70 p-6 sm:p-7 ${item.tone}`}
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-background/80 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.eyebrow}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
              <Link
                to={item.to}
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                {item.link}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/35">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              A good place to begin
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              From first hello to finished work.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Explore public profiles, learn what people make, and reach out through the tools
              already here. Every great collaboration begins with a connection.
            </p>
            <Link
              to="/about"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              How it works <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              { n: "01", title: "Discover", text: "Find creators, organizations and work." },
              { n: "02", title: "Connect", text: "Explore services and send a request." },
              {
                n: "03",
                title: "Create",
                text: "Turn an accepted booking into a shared workspace.",
              },
            ].map((step) => (
              <li key={step.n} className="rounded-2xl border border-border/70 bg-card p-5">
                <p className="font-display text-sm font-semibold text-primary">{step.n}</p>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-6 rounded-[2rem] bg-primary px-6 py-9 text-primary-foreground sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/80">
              <Building2 className="size-4" aria-hidden /> Creators, organizations and communities
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Your next creative connection is out there.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
              Come explore what people are making and find your place in the ecosystem.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/discover">
              <Button size="lg" variant="gold">
                Start exploring
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Create your account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
