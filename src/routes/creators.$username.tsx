import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Globe, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicCreatorProfile } from "@/lib/creator.functions";
import { initialsFrom } from "@/lib/profile";
import {
  AVAILABILITY_LABELS,
  EXPERIENCE_LABELS,
  LINK_PLATFORMS,
  creatorDisplayName,
  type CreatorAvailability,
  type LinkPlatform,
  type PublicCreatorProfile,
} from "@/lib/creator";

const AVAILABILITY_VARIANT: Record<CreatorAvailability, "success" | "gold" | "muted"> = {
  available: "success",
  limited: "gold",
  unavailable: "muted",
};

export const Route = createFileRoute("/creators/$username")({
  loader: async ({ params }) => {
    const profile = (await getPublicCreatorProfile({
      data: { username: params.username },
    })) as PublicCreatorProfile | null;
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Creator not found — Inspire to Aspire" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { profile } = loaderData;
    const name = creatorDisplayName(
      profile.creator.creator_name,
      profile.display_name,
      profile.username,
    );
    const description = profile.creator.headline;
    return {
      meta: [
        { title: `${name} — Creator on Inspire to Aspire` },
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
      <PageHeader
        eyebrow="Creator"
        title="Something went wrong"
        description="We couldn't load this creator profile."
      />
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <PageHeader
        eyebrow="Creator"
        title="Creator profile not available"
        description="This creator profile doesn't exist, or the creator has kept it private."
        actions={
          <Link to="/creators">
            <Button variant="outline">Browse creators</Button>
          </Link>
        }
      />
    </SiteLayout>
  ),
  component: PublicCreatorPage,
});

function PublicCreatorPage() {
  const { profile } = Route.useLoaderData() as { profile: PublicCreatorProfile };
  const creator = profile.creator;
  const name = creatorDisplayName(creator.creator_name, profile.display_name, profile.username);
  const location = creator.location ?? profile.profile_location;
  const website = creator.website ?? profile.profile_website;
  const links = LINK_PLATFORMS.map((platform) => ({
    label: platform.label,
    href: creator.links?.[platform.key as LinkPlatform],
  })).filter((link) => Boolean(link.href)) as { label: string; href: string }[];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Creator" title={name} description={creator.headline} />

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${name} profile photo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center font-display text-2xl font-semibold text-muted-foreground">
                    {initialsFrom(profile.display_name, profile.username)}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-2">
                <p className="font-display text-xl font-semibold">{name}</p>
                <Link
                  to="/profile/$username"
                  params={{ username: profile.username }}
                  className="block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  @{profile.username}
                </Link>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant={AVAILABILITY_VARIANT[creator.availability]}>
                    {AVAILABILITY_LABELS[creator.availability]}
                  </Badge>
                  <Badge variant="secondary">{EXPERIENCE_LABELS[creator.experience_level]}</Badge>
                  {creator.years_experience !== null ? (
                    <Badge variant="outline">{creator.years_experience} years</Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm text-muted-foreground">
                  {location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" aria-hidden />
                      {location}
                    </span>
                  ) : null}
                  {website ? (
                    <a
                      className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <Globe className="size-4" aria-hidden />
                      {website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            {creator.primary_category || creator.categories.length > 0 ? (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Disciplines</h2>
                <div className="flex flex-wrap gap-2">
                  {creator.primary_category ? (
                    <Badge>{creator.primary_category.name}</Badge>
                  ) : null}
                  {creator.categories.map((category) => (
                    <Badge key={category.slug} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {creator.about ? (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">About</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {creator.about}
                </p>
              </div>
            ) : null}

            {creator.skills.length > 0 ? (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {creator.skills.map((skill) => (
                    <Badge key={skill.slug} variant="outline">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {links.length > 0 ? (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Elsewhere</h2>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        className="underline underline-offset-4 hover:text-foreground"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="photo-placeholder aspect-[4/3] w-full rounded-lg" aria-hidden />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Selected work from {name} arrives with the portfolio phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
