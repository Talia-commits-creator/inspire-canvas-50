import { createFileRoute } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Inspire to Aspire" },
      { name: "description", content: "Sign in to your Inspire to Aspire account." },
      { property: "og:title", content: "Login — Inspire to Aspire" },
      { property: "og:description", content: "Sign in to your account." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Account"
      title="Sign in"
      description="Authentication will be enabled once Lovable Cloud is connected."
      icon={LogIn}
    />
  ),
});
