import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Inspire to Aspire" },
      { name: "description", content: "Discover creators, organizations, and projects on Inspire to Aspire." },
      { property: "og:title", content: "Discover — Inspire to Aspire" },
      { property: "og:description", content: "Discover talent, work, and opportunities across the platform." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Discover"
      title="Discover the ecosystem"
      description="Search, browse, and explore creators, organizations, and projects across the platform."
    />
  ),
});
