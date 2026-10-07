import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { OrganizationCard } from "@/components/entities/organization-card";
import { listPublicOrganizations } from "@/lib/organization.functions";
import type { OrganizationListItem } from "@/lib/organization";

export const Route = createFileRoute("/organizations")({
  loader: async () => ({
    organizations: (await listPublicOrganizations()) as OrganizationListItem[],
  }),
  head: () => ({
    meta: [
      { title: "Organizations — DAREY CREATIVES" },
      {
        name: "description",
        content: "Discover organizations, institutions and creative groups across DAREY CREATIVES.",
      },
      { property: "og:title", content: "Organizations — DAREY CREATIVES" },
      {
        property: "og:description",
        content: "Creative organizations and community groups building opportunities for talent.",
      },
    ],
  }),
  errorComponent: OrganizationDirectoryError,
  component: OrganizationsIndexPage,
});

function OrganizationDirectoryError() {
  const router = useRouter();
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Organizations"
        title="The directory couldn't load"
        description="Try again in a moment, or keep exploring creators and community while we reconnect."
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

function OrganizationsIndexPage() {
  const { organizations } = Route.useLoaderData() as { organizations: OrganizationListItem[] };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Organizations"
        title="The people building creative spaces"
        description="Meet the studios, institutions and community organizations making room for creative work."
        actions={
          <Link to="/settings/organization">
            <Button>Create an organization</Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {organizations.length === 0 ? (
          <EmptyState
            title="No public organizations yet"
            description="Organizations appear here as soon as they publish a profile for the community to discover."
            action={
              <Link to="/settings/organization">
                <Button>Create your organization</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((organization) => (
              <OrganizationCard key={organization.id} organization={organization} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
