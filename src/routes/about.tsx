import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Inspire to Aspire" },
      { name: "description", content: "Learn about the mission behind Inspire to Aspire." },
      { property: "og:title", content: "About — Inspire to Aspire" },
      {
        property: "og:description",
        content: "Our mission: connecting talent, opportunities, and communities.",
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
        description="Inspire to Aspire exists to connect creators, clients, organizations, and communities through a fair, transparent, and inspiring platform."
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
