import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreatorProfileForm,
  EMPTY_LINKS,
  emptyCreatorForm,
  toCreatorInput,
  type CreatorFormValues,
} from "@/components/creator/creator-profile-form";
import {
  useCreativeCategories,
  useCreativeSkills,
  useMyCreatorProfile,
  useSaveCreatorProfile,
} from "@/hooks/use-creator";
import { useProfile } from "@/hooks/use-profile";
import { creatorErrorMessage, LINK_PLATFORMS, type LinkPlatform } from "@/lib/creator";

export const Route = createFileRoute("/_authenticated/settings/creator")({
  head: () => ({
    meta: [
      { title: "Creator profile — Inspire to Aspire" },
      {
        name: "description",
        content: "Set up your creative identity, categories, skills and availability as a creator.",
      },
      { property: "og:title", content: "Creator profile — Inspire to Aspire" },
      { property: "og:description", content: "Define what you create and how people can work with you." },
    ],
  }),
  component: CreatorProfileSettingsPage,
});

function CreatorProfileSettingsPage() {
  const categoriesQuery = useCreativeCategories();
  const skillsQuery = useCreativeSkills();
  const creatorQuery = useMyCreatorProfile();
  const profileQuery = useProfile();
  const save = useSaveCreatorProfile();

  const [values, setValues] = useState<CreatorFormValues>(emptyCreatorForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const existing = creatorQuery.data ?? null;
  const mode = existing ? "edit" : "create";

  useEffect(() => {
    if (hydrated || creatorQuery.isLoading) return;
    if (existing) {
      const links = { ...EMPTY_LINKS };
      for (const platform of LINK_PLATFORMS) {
        links[platform.key] = existing.profile.links?.[platform.key as LinkPlatform] ?? "";
      }
      setValues({
        creator_name: existing.profile.creator_name ?? "",
        headline: existing.profile.headline,
        about: existing.profile.about ?? "",
        primary_category_id: existing.profile.primary_category_id ?? "",
        location: existing.profile.location ?? "",
        availability: existing.profile.availability,
        experience_level: existing.profile.experience_level,
        years_experience:
          existing.profile.years_experience === null ? "" : String(existing.profile.years_experience),
        website: existing.profile.website ?? "",
        links,
        visibility: existing.profile.visibility,
        categoryIds: existing.categoryIds,
        skillIds: existing.skillIds,
      });
    }
    setHydrated(true);
  }, [existing, creatorQuery.isLoading, hydrated]);

  function handleSubmit(next: CreatorFormValues) {
    setFormError(null);
    save.mutate(toCreatorInput(next), {
      onSuccess: () => {
        toast.success(mode === "create" ? "Your creator profile is live." : "Creator profile updated.");
      },
      onError: (error: unknown) => {
        setFormError(creatorErrorMessage((error as { message?: string })?.message));
      },
    });
  }

  const loading = creatorQuery.isLoading || categoriesQuery.isLoading || skillsQuery.isLoading;
  const username = profileQuery.data?.username;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Creator"
        title={mode === "create" ? "Become a creator" : "Your creator profile"}
        description={
          mode === "create"
            ? "Tell people what you create. This sits alongside your universal profile — no need to repeat your name, photo or username."
            : "Keep your creative identity, skills and availability up to date."
        }
        actions={
          existing && username ? (
            <Link to="/creators/$username" params={{ username }}>
              <Button variant="outline">View public profile</Button>
            </Link>
          ) : null
        }
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : creatorQuery.isError || categoriesQuery.isError || skillsQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load your creator profile right now.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void creatorQuery.refetch();
                  void categoriesQuery.refetch();
                  void skillsQuery.refetch();
                }}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {mode === "edit" && existing?.profile.visibility === "private" ? (
              <Alert className="mb-6">
                <AlertDescription>
                  Your creator profile is private. Only you can see it, and it stays out of creator
                  discovery until you make it public.
                </AlertDescription>
              </Alert>
            ) : null}
            <CreatorProfileForm
              mode={mode}
              values={values}
              onChange={setValues}
              categories={categoriesQuery.data ?? []}
              skills={skillsQuery.data ?? []}
              onSubmit={handleSubmit}
              saving={save.isPending}
              formError={formError}
            />
          </>
        )}
      </div>
    </SiteLayout>
  );
}
