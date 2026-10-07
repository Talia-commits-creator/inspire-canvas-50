import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DAREY CREATIVES" },
      { name: "description", content: "Learn about the mission behind DAREY CREATIVES." },
      { property: "og:title", content: "About — DAREY CREATIVES" },
      {
        property: "og:description",
        content:
          "Inspire to Aspire — Connecting Talent. Creating Opportunities. Inspiring Communities.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="A place for creative people to find each other"
        description="DAREY CREATIVES is built on our core mission: Inspire to Aspire — connecting talent, creating opportunities, and inspiring communities through a fair, transparent, and collaborative platform."
      />
      <section className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-8 sm:px-6 sm:py-12 md:grid-cols-3 lg:px-8">
        <article className="rounded-3xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Creators</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Build a profile around your practice, share selected work, and explain the services you
            offer.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Clients and organizations</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Discover creative people and services, then send a request when you find a good fit.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Community</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Share updates, ideas, opportunities, and creative work with people across the ecosystem.
          </p>
        </article>
      </section>
    </SiteLayout>
  );
}
