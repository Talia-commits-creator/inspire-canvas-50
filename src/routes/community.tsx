import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Inspire to Aspire" },
      { name: "description", content: "Join conversations, groups, and events across the community." },
      { property: "og:title", content: "Community — Inspire to Aspire" },
      { property: "og:description", content: "Groups, discussions, and events for creators and audiences." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Community"
      title="Where the ecosystem gathers"
      description="Groups, discussions, events, and shared spaces for creators and audiences."
      icon={Users}
    />
  ),
});
