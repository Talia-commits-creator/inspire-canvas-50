import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/organizations")({
  head: () => ({
    meta: [
      { title: "Organizations — Inspire to Aspire" },
      { name: "description", content: "Organizations discovering and hiring creative talent." },
      { property: "og:title", content: "Organizations — Inspire to Aspire" },
      { property: "og:description", content: "Teams, brands, and institutions collaborating with creators." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Organizations"
      title="Teams and institutions"
      description="Companies, brands, agencies, and non-profits collaborating with creators."
    />
  ),
});
