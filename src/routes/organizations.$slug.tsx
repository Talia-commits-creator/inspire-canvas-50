import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { getPublicOrganization } from "@/lib/organization.functions";
import type { PublicOrganization } from "@/lib/organization";

export const Route = createFileRoute("/organizations/$slug")({
  loader: async ({ params }) => {
    const organization = (await getPublicOrganization({ data: { slug: params.slug } })) as PublicOrganization | null;
    if (!organization) throw notFound();
    return { organization };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Organization not found — Inspire to Aspire" }, { name: "robots", content: "noindex" }],
      };
    }
    const { organization } = loaderData;
    return {
      meta: [
        { title: `${organization.name} — Organization on Inspire to Aspire` },
        { name: "description", content: organization.short_description },
        { property: "og:title", content: `${organization.name} on Inspire to Aspire` },
        { property: "og:description", content: organization.short_description },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <PageHeader
        eyebrow="Organization"
        title="Organization profile not available"
        description="This organization doesn't exist or is set to private."
        actions={
          <Link to="/organizations">
            <Button variant="outline">Browse organizations</Button>
          </Link>
        }
      />
    </SiteLayout>
  ),
  component: PublicOrganizationPage,
});

function PublicOrganizationPage() {
  const { organization } = Route.useLoaderData() as { organization: PublicOrganization };
  const links = Object.entries(organization.links ?? {}).filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Organization" title={organization.name} description={organization.short_description} />

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
                {organization.logo_url ? (
                  <img src={organization.logo_url} alt={`${organization.name} logo`} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center font-display text-2xl font-semibold text-muted-foreground">
                    {organization.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("") || "ORG"}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-2">
                <p className="font-display text-xl font-semibold">{organization.name}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge>{organization.organization_type}</Badge>
                  {organization.visibility === "public" ? <Badge variant="secondary">Public</Badge> : <Badge variant="outline">Private</Badge>}
                </div>
                <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
                  {organization.location ? <span>{organization.location}</span> : null}
                  {organization.website ? (
                    <a href={organization.website} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
                      {organization.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {organization.description ? (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">About</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {organization.description}
                </p>
              </div>
            ) : null}

            {links.length > 0 ? (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Links</h2>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {links.map(([platform, href]) => (
                    <li key={platform}>
                      <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
                        {platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
