import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Globe, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useAvatarUrl, useProfile, useRoles } from "@/hooks/use-profile";
import { PROFILE_FIELD_LABELS, initialsFrom, profileCompletion } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Inspire to Aspire" },
      { name: "description", content: "Your account home on Inspire to Aspire." },
      { property: "og:title", content: "Dashboard — Inspire to Aspire" },
      { property: "og:description", content: "Your profile summary and account settings." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { data: roles } = useRoles();
  const { data: avatarUrl } = useAvatarUrl(profile?.avatar_url);

  const completion = profileCompletion(profile ?? null);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("You have been signed out.");
      navigate({ to: "/login", search: {}, replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Workspace"
        title={profile?.display_name ? `Welcome back, ${profile.display_name}` : "Welcome back"}
        description="Your account home. Manage how you are represented across Inspire to Aspire."
        actions={
          <>
            <Link to="/settings/profile">
              <Button>Edit profile</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Logging out…" : "Log out"}
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : isError || !profile ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load your profile right now.</span>
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Your profile</CardTitle>
                <CardDescription>Public information other people can see.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${profile.display_name ?? profile.username} profile photo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-display text-lg font-semibold text-muted-foreground">
                        {initialsFrom(profile.display_name, profile.username)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="font-display text-lg font-semibold">
                      {profile.display_name ?? "Add your display name"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">/profile/{profile.username}</p>
                    {roles && roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {roles.map((role) => (
                          <Badge key={role} variant="secondary" className="capitalize">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="pt-1 text-sm text-muted-foreground">
                        No platform roles yet — these arrive with Creator Profiles.
                      </p>
                    )}
                  </div>
                </div>

                {profile.bio ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {profile.bio}
                  </p>
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

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Profile completion</CardTitle>
                <CardDescription>
                  {completion.completed} of {completion.total} details added. Everything here is optional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={completion.percent} aria-label="Profile completion" />
                {completion.missing.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Still to add: {completion.missing.map((f) => PROFILE_FIELD_LABELS[f] ?? f).join(", ")}.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Your profile is complete.</p>
                )}
                <Link to="/settings/profile">
                  <Button variant="outline" size="sm">
                    Edit profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
