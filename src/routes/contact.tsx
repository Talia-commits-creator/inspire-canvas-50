import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SiteLayout } from "@/components/layout/site-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Inspire to Aspire" },
      { name: "description", content: "Get in touch with the Inspire to Aspire team." },
      { property: "og:title", content: "Contact — Inspire to Aspire" },
      {
        property: "og:description",
        content: "Reach out with questions, partnerships, or press inquiries.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description="Questions, partnerships, or press — we'd love to hear from you."
      />
      <section className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <a
          className="flex min-h-20 items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="tel:+905428797899"
        >
          <Phone className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-semibold">Call us</span>
            <span className="mt-1 block text-sm text-muted-foreground">+90 542 879 7899</span>
          </span>
        </a>
        <a
          className="flex min-h-20 items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="https://wa.me/905428797899"
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-semibold">Message us on WhatsApp</span>
            <span className="mt-1 block text-sm text-muted-foreground">+90 542 879 7899</span>
          </span>
        </a>
        <a
          className="flex min-h-20 items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="mailto:hello@inspiretoaspire.com"
        >
          <Mail className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block font-semibold">Email</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              hello@inspiretoaspire.com
            </span>
          </span>
        </a>
        <p className="px-1 text-sm leading-relaxed text-muted-foreground">
          The email address is planned for the website and may not be active until its mailbox is
          set up.
        </p>
      </section>
    </SiteLayout>
  );
}
