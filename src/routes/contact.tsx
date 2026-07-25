import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Inspire to Aspire" },
      { name: "description", content: "Get in touch with the Inspire to Aspire team." },
      { property: "og:title", content: "Contact — Inspire to Aspire" },
      { property: "og:description", content: "Reach out with questions, partnerships, or press inquiries." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Contact"
      title="Get in touch"
      description="Questions, partnerships, or press — we'd love to hear from you."
      icon={Mail}
    />
  ),
});
