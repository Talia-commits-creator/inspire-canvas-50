import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Globe, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicProfile } from "@/lib/profile.functions";
import { initialsFrom } from "@/lib/profile";

export const Route = createFileRoute("/profile/$username")({
  loader: async ({ params }) => {
    const profile = await getPublicProfile({ data: { username: params.username } });
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Profile not found — Inspire to Aspire" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const name = loaderData.profile.display_name ?? loaderData.profile.username;
    const description =
      loaderData.profile.bio?.slice(0, 150) ?? `${name} on Inspire to Aspire.`;
    return {
      meta: [
        { title: `${name} (@${loaderData.profile.username}) — Inspire to Aspire` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} on Inspire to Aspire` },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  errorComponent: () => (
    <SiteLayout>
      <PageHeader eyebrow="Profile" title="Something went wrong" description="We couldn't load this profile." />
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <PageHeader
        eyebrow="Profile"
        title="Profile not found"
        description="No one on Inspire to Aspire uses that username."
        actions={
          <Link to="/creators">
            <Button variant="outline">Browse creators</Button>
          </Link>
        }
      />
    </SiteLayout>
  ),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { profile } = Route.useLoaderData();
  const name = profile.display_name ?? profile.username;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Profile" title={name} description={`@${profile.username}`} />

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${name} profile photo`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center font-display text-xl font-semibold text-muted-foreground">
                    {initialsFrom(profile.display_name, profile.username)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold">{name}</p>
                <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>

            {profile.bio ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
            ) : null}

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {profile.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden />
                  {profile.location}
                </span>
              ) : null}
              {profile.website ? (
                <a
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <Globe className="size-4" aria-hidden />
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
