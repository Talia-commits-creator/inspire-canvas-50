import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/common/placeholder-page";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Inspire to Aspire" },
      { name: "description", content: "Explore active and featured projects on the platform." },
      { property: "og:title", content: "Projects — Inspire to Aspire" },
      { property: "og:description", content: "Featured work, collaborations, and open opportunities." },
    ],
  }),
  component: () => (
    <PlaceholderPage
      eyebrow="Projects"
      title="Work in motion"
      description="Featured collaborations, open briefs, and public projects."
    />
  ),
});
