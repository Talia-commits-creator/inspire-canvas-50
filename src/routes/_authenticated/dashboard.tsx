import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Globe,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
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
import { useMySubscription } from "@/hooks/use-premium";
import { useMyCreatorProfile } from "@/hooks/use-creator";
import { useMyOrganization } from "@/hooks/use-organization";
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
  const { data: subscription } = useMySubscription();
  const { data: creatorData } = useMyCreatorProfile();
  const { data: orgData } = useMyOrganization();

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
        title={
          profile?.display_name ? `Welcome, ${profile.display_name}` : "Welcome to your workspace"
        }
        description="What would you like to make happen next? Your creative workspace starts here."
        actions={
          <>
            <Link to="/settings/profile">
              <Button>Edit profile</Button>
            </Link>
            <Link to="/settings/plans">
              <Button variant="outline">Membership & Plans</Button>
            </Link>
            {roles?.includes("admin") ? (
              <Link to="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            ) : null}
            <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Logging out…" : "Log out"}
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
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
          <div className="space-y-8">
            <section aria-labelledby="workspace-heading">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    Your workspace
                  </p>
                  <h2 id="workspace-heading" className="mt-1 font-display text-2xl font-semibold">
                    Pick up where you need to
                  </h2>
                </div>
                <Badge variant="gold">{subscription?.plan.name ?? "Free Community"}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    label: "Creator Studio",
                    detail: "Profile, services & portfolio",
                    to: "/settings/creator",
                    icon: Sparkles,
                    tone: "surface-warm",
                  },
                  {
                    label: "Organizations",
                    detail: "Manage your organization",
                    to: "/settings/organization",
                    icon: Building2,
                    tone: "surface-teal",
                  },
                  {
                    label: "Bookings",
                    detail: "Review your requests",
                    to: "/settings/bookings",
                    icon: Calendar,
                    tone: "bg-secondary/65",
                  },
                  {
                    label: "Collaborations",
                    detail: "Open shared workspaces",
                    to: "/settings/collaborations",
                    icon: Users,
                    tone: "bg-secondary/65",
                  },
                  {
                    label: "Community",
                    detail: "Manage your posts",
                    to: "/settings/community",
                    icon: FileText,
                    tone: "bg-secondary/65",
                  },
                ].map(({ label, detail, to, icon: Icon, tone }) => (
                  <Link
                    key={label}
                    to={to}
                    className={`creative-card group flex min-h-28 items-center gap-4 rounded-2xl border border-border/70 p-4 ${tone}`}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background/80 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-semibold">{label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
                    </span>
                    <span
                      aria-hidden
                      className="text-lg text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
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
                    <p className="truncate text-sm text-muted-foreground">
                      /profile/{profile.username}
                    </p>
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
                  {completion.completed} of {completion.total} details added. Everything here is
                  optional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={completion.percent} aria-label="Profile completion" />
                {completion.missing.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Still to add:{" "}
                    {completion.missing.map((f) => PROFILE_FIELD_LABELS[f] ?? f).join(", ")}.
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

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-xl">Membership tier</CardTitle>
                  <Badge
                    variant={subscription?.plan.slug === "creator_pro" ? "default" : "secondary"}
                  >
                    {subscription?.plan.name ?? "Free Community"}
                  </Badge>
                </div>
                <CardDescription>
                  Your active membership plan and tier capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {subscription?.plan.slug === "creator_pro"
                    ? "You have Creator Pro enabled with expanded portfolio capacity (60 works) and up to 50 active services."
                    : "You are on the Free Community tier with standard portfolio showcase (6 works) and 3 service listings."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/settings/plans">
                    <Button variant="outline" size="sm">
                      Manage plan
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="ghost" size="sm">
                      Compare all plans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" aria-hidden />
                    <CardTitle className="font-display text-xl">Creator Studio</CardTitle>
                  </div>
                  {creatorData ? (
                    <Badge variant="secondary" className="capitalize">
                      {creatorData.profile.availability}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not yet set up</Badge>
                  )}
                </div>
                <CardDescription>
                  {creatorData
                    ? creatorData.profile.headline
                    : "Become a creator to list services, showcase your portfolio, and receive booking requests."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {creatorData ? (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Link to="/settings/creator">
                      <Button variant="outline" size="sm" className="w-full">
                        Profile
                      </Button>
                    </Link>
                    <Link to="/settings/creator/services">
                      <Button variant="outline" size="sm" className="w-full">
                        Services
                      </Button>
                    </Link>
                    <Link to="/settings/creator/portfolio">
                      <Button variant="outline" size="sm" className="w-full">
                        Portfolio
                      </Button>
                    </Link>
                    <Link to="/settings/creator/bookings">
                      <Button variant="outline" size="sm" className="w-full">
                        Bookings
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Link to="/settings/creator">
                    <Button size="sm">Become a creator</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-5 text-primary" aria-hidden />
                    <CardTitle className="font-display text-xl">Organization</CardTitle>
                  </div>
                  {orgData ? (
                    <Badge variant="secondary" className="capitalize">
                      {orgData.organization_type}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not created</Badge>
                  )}
                </div>
                <CardDescription>
                  {orgData
                    ? orgData.name +
                      (orgData.short_description ? ` — ${orgData.short_description}` : "")
                    : "Establish a public profile for your studio, university, community group, or brand."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Link to="/settings/organization">
                    <Button variant={orgData ? "outline" : "default"} size="sm">
                      {orgData ? "Manage organization" : "Create organization"}
                    </Button>
                  </Link>
                  {orgData ? (
                    <Link to="/organizations/$slug" params={{ slug: orgData.slug }}>
                      <Button variant="ghost" size="sm">
                        View public profile
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/organizations">
                      <Button variant="ghost" size="sm">
                        Browse directory
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="size-5 text-primary" aria-hidden />
                  <CardTitle className="font-display text-xl">Workspaces & Community</CardTitle>
                </div>
                <CardDescription>
                  Manage requests sent to creators, shared collaboration workspaces, and your public
                  community posts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Link to="/settings/bookings">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Calendar className="size-4 text-muted-foreground" aria-hidden />
                      <span>My bookings</span>
                    </Button>
                  </Link>
                  <Link to="/settings/collaborations">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Users className="size-4 text-muted-foreground" aria-hidden />
                      <span>Collaborations</span>
                    </Button>
                  </Link>
                  <Link to="/settings/community">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <FileText className="size-4 text-muted-foreground" aria-hidden />
                      <span>Community posts</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
