import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Inspire to Aspire" },
      { name: "description", content: "Learn about the mission behind Inspire to Aspire." },
      { property: "og:title", content: "About — Inspire to Aspire" },
      { property: "og:description", content: "Our mission: connecting talent, opportunities, and communities." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="About"
      title="Our mission"
      description="Inspire to Aspire exists to connect creators, clients, organizations, and communities through a fair, transparent, and inspiring platform."
    />
  ),
});
