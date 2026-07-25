import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creators — Inspire to Aspire" },
      { name: "description", content: "Browse creator portfolios and talent on Inspire to Aspire." },
      { property: "og:title", content: "Creators — Inspire to Aspire" },
      { property: "og:description", content: "Portfolios, services, and stories from creators around the world." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Creators"
      title="Talent, portfolios, and voices"
      description="A home for creators to publish work, offer services, and build their audience."
      icon={Sparkles}
    />
  ),
});
