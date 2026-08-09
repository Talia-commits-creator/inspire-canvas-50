import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import {
  PROFILE_LIMITS,
  normalizeUsername,
  normalizeWebsite,
  profileErrorMessage,
  validateBio,
  validateDisplayName,
  validateLocation,
  validateUsername,
  validateWebsite,
} from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/settings/profile")({
  head: () => ({
    meta: [
      { title: "Edit profile — Inspire to Aspire" },
      { name: "description", content: "Update your display name, username, photo and bio on Inspire to Aspire." },
      { property: "og:title", content: "Edit profile — Inspire to Aspire" },
      { property: "og:description", content: "Manage how you are represented on Inspire to Aspire." },
    ],
  }),
  component: EditProfilePage,
});

type Fields = {
  display_name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
};

function EditProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const update = useUpdateProfile();

  const [fields, setFields] = useState<Fields>({
    display_name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFields({
      display_name: profile.display_name ?? "",
      username: profile.username,
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      website: profile.website ?? "",
    });
  }, [profile]);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (update.isPending) return;

    const nextErrors: Partial<Record<keyof Fields, string>> = {};
    const displayNameError = validateDisplayName(fields.display_name);
    if (displayNameError) nextErrors.display_name = displayNameError;
    const usernameError = validateUsername(fields.username);
    if (usernameError) nextErrors.username = usernameError;
    const bioError = validateBio(fields.bio);
    if (bioError) nextErrors.bio = bioError;
    const locationError = validateLocation(fields.location);
    if (locationError) nextErrors.location = locationError;
    const websiteError = validateWebsite(fields.website);
    if (websiteError) nextErrors.website = websiteError;

    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const saved = await update.mutateAsync({
        display_name: fields.display_name.trim() || null,
        username: normalizeUsername(fields.username),
        bio: fields.bio.trim() || null,
        location: fields.location.trim() || null,
        website: fields.website.trim() ? normalizeWebsite(fields.website) : null,
      });
      setFields((prev) => ({ ...prev, username: saved.username }));
      toast.success("Profile updated.");
    } catch (err) {
      const message = profileErrorMessage(err instanceof Error ? err.message : undefined);
      if (message.toLowerCase().includes("username")) setErrors({ username: message });
      else setFormError(message);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Account"
        title="Edit profile"
        description="This is how you appear across Inspire to Aspire. Your email stays private."
        actions={
          <Link to="/dashboard">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : isError || !profile ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load your profile.</span>
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Profile photo</CardTitle>
                <CardDescription>Uploaded to your own private folder and shown on your profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUploader
                  avatarPath={profile.avatar_url}
                  displayName={profile.display_name}
                  username={profile.username}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Public details</CardTitle>
                <CardDescription>Visible to other people on the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {formError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display name</Label>
                  <Input
                    id="display_name"
                    value={fields.display_name}
                    maxLength={PROFILE_LIMITS.displayName.max}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.display_name)}
                    onChange={(e) => set("display_name", e.target.value)}
                  />
                  {errors.display_name ? (
                    <p className="text-sm text-destructive">{errors.display_name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/profile/</span>
                    <Input
                      id="username"
                      value={fields.username}
                      maxLength={PROFILE_LIMITS.username.max}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={Boolean(errors.username)}
                      onChange={(e) => set("username", e.target.value.toLowerCase())}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    3–30 characters. Letters, numbers, hyphens and underscores.
                  </p>
                  {errors.username ? <p className="text-sm text-destructive">{errors.username}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={5}
                    value={fields.bio}
                    maxLength={PROFILE_LIMITS.bio.max}
                    aria-invalid={Boolean(errors.bio)}
                    onChange={(e) => set("bio", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {fields.bio.trim().length}/{PROFILE_LIMITS.bio.max}
                  </p>
                  {errors.bio ? <p className="text-sm text-destructive">{errors.bio}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={fields.location}
                    maxLength={PROFILE_LIMITS.location.max}
                    placeholder="City, country"
                    aria-invalid={Boolean(errors.location)}
                    onChange={(e) => set("location", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">General area only — no street addresses.</p>
                  {errors.location ? <p className="text-sm text-destructive">{errors.location}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    inputMode="url"
                    value={fields.website}
                    maxLength={PROFILE_LIMITS.website.max}
                    placeholder="yourwork.com"
                    aria-invalid={Boolean(errors.website)}
                    onChange={(e) => set("website", e.target.value)}
                  />
                  {errors.website ? <p className="text-sm text-destructive">{errors.website}</p> : null}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button type="submit" className="w-full sm:w-auto" disabled={update.isPending}>
                {update.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Link to="/profile/$username" params={{ username: profile.username }} className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full">
                  View public profile
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}
