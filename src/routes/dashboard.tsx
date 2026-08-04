import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Inspire to Aspire" },
      { name: "description", content: "Your personal dashboard." },
      { property: "og:title", content: "Dashboard — Inspire to Aspire" },
      { property: "og:description", content: "Your personal workspace on the platform." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Workspace"
      title="Dashboard"
      description="Your personal workspace. Widgets and modules will land here as features ship."
    />
  ),
});
