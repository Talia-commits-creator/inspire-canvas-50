import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Inspire to Aspire" },
      { name: "description", content: "Create your Inspire to Aspire account." },
      { property: "og:title", content: "Create account — Inspire to Aspire" },
      { property: "og:description", content: "Join the platform as a creator, client, or organization." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Account"
      title="Create your account"
      description="Registration will be enabled once Lovable Cloud is connected."
      icon={UserPlus}
    />
  ),
});
