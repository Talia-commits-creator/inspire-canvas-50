import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { listPublicOrganizations } from "@/lib/organization.functions";
import type { OrganizationListItem } from "@/lib/organization";

export const Route = createFileRoute("/organizations")({
  loader: async () => ({ organizations: (await listPublicOrganizations()) as OrganizationListItem[] }),
  head: () => ({
    meta: [
      { title: "Organizations — Inspire to Aspire" },
      { name: "description", content: "Discover organizations, institutions and creative groups across Inspire to Aspire." },
      { property: "og:title", content: "Organizations — Inspire to Aspire" },
      { property: "og:description", content: "Creative organizations and community groups building opportunities for talent." },
    ],
  }),
  component: OrganizationsIndexPage,
});

function OrganizationsIndexPage() {
  const { organizations } = Route.useLoaderData() as { organizations: OrganizationListItem[] };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Organizations"
        title="Creative organizations and institutions"
        description="Discover groups, institutions, studios and community partners creating opportunities for creative work."
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
              <div key={organization.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center gap-4 border-b border-border p-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                    {organization.logo_url ? (
                      <img src={organization.logo_url} alt={`${organization.name} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-display text-base font-semibold text-muted-foreground">
                        {organization.name
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase() ?? "")
                          .join("") || "ORG"}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-semibold">{organization.name}</h3>
                    <p className="text-sm text-muted-foreground">{organization.organization_type}</p>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {organization.location ? <p className="text-sm text-muted-foreground">{organization.location}</p> : null}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {organization.short_description || "This organization has not added a summary yet."}
                  </p>
                  <Link to="/organizations/$slug" params={{ slug: organization.slug }}>
                    <Button variant="outline" size="sm">View profile</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
