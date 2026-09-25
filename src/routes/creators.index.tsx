import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { CreatorCard } from "@/components/entities/creator-card";
import { listPublicCreators } from "@/lib/creator.functions";
import type { CreatorListItem } from "@/lib/creator";

export const Route = createFileRoute("/creators/")({
  loader: async () => ({ creators: (await listPublicCreators()) as CreatorListItem[] }),
  head: () => ({
    meta: [
      { title: "Creators — Inspire to Aspire" },
      {
        name: "description",
        content:
          "Meet the creators on Inspire to Aspire: DJs, photographers, producers, writers and more.",
      },
      { property: "og:title", content: "Creators — Inspire to Aspire" },
      {
        property: "og:description",
        content: "Creative identities, disciplines and skills from creators across the community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: CreatorDirectoryError,
  component: CreatorsIndexPage,
});

function CreatorDirectoryError() {
  const router = useRouter();
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Creators"
        title="The directory couldn't load"
        description="Your connection may be interrupted. Try again, or explore another part of the ecosystem."
        actions={
          <>
            <Button onClick={() => void router.invalidate()}>Try again</Button>
            <Link to="/discover">
              <Button variant="outline">Explore the platform</Button>
            </Link>
          </>
        }
      />
    </SiteLayout>
  );
}

function CreatorsIndexPage() {
  const { creators } = Route.useLoaderData() as { creators: CreatorListItem[] };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Creators"
        title="Meet the people behind the work"
        description="Browse public creator profiles, explore their practice and find the right person for what you have in mind."
        actions={
          <Link to="/settings/creator">
            <Button>Become a creator</Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {creators.length === 0 ? (
          <EmptyState
            title="No public creator profiles yet"
            description="Creators appear here as soon as they publish their creative identity."
            action={
              <Link to="/settings/creator">
                <Button>Create your creator profile</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard
                key={creator.username}
                creator={{
                  username: creator.username,
                  name: creator.creator_name ?? creator.display_name ?? creator.username,
                  headline: creator.headline,
                  primaryCategory: creator.primary_category,
                  location: creator.location,
                  availability: creator.availability,
                  avatarUrl: creator.avatar_url,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
