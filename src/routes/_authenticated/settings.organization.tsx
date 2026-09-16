import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationForm, emptyOrganizationForm, toOrganizationInput, validateOrganizationForm, type OrganizationFormValues } from "@/components/organization/organization-form";
import { useMyOrganization, useSaveOrganization } from "@/hooks/use-organization";
import { organizationErrorMessage } from "@/lib/organization";

export const Route = createFileRoute("/_authenticated/settings/organization")({
  head: () => ({
    meta: [
      { title: "Organization profile — Inspire to Aspire" },
      { name: "description", content: "Create or update your organization profile on Inspire to Aspire." },
      { property: "og:title", content: "Organization profile — Inspire to Aspire" },
      { property: "og:description", content: "Establish your organization’s public identity and presence." },
    ],
  }),
  component: OrganizationSettingsPage,
});

function OrganizationSettingsPage() {
  const organizationQuery = useMyOrganization();
  const save = useSaveOrganization();
  const existing = organizationQuery.data ?? null;
  const mode = existing ? "edit" : "create";

  const [values, setValues] = useState<OrganizationFormValues>(emptyOrganizationForm);
  const [errors, setErrors] = useState<Partial<Record<keyof OrganizationFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated || organizationQuery.isLoading) return;
    if (existing) {
      setValues({
        name: existing.name,
        slug: existing.slug,
        short_description: existing.short_description,
        description: existing.description ?? "",
        organization_type: existing.organization_type,
        location: existing.location ?? "",
        website: existing.website ?? "",
        links: {
          website: existing.links?.website ?? "",
          linkedin: existing.links?.linkedin ?? "",
          instagram: existing.links?.instagram ?? "",
          x: existing.links?.x ?? "",
          facebook: existing.links?.facebook ?? "",
          youtube: existing.links?.youtube ?? "",
          bluesky: existing.links?.bluesky ?? "",
        },
        visibility: existing.visibility,
      });
    }
    setHydrated(true);
  }, [existing, hydrated, organizationQuery.isLoading]);

  function handleSubmit() {
    const nextErrors = validateOrganizationForm(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    save.mutate(toOrganizationInput(values), {
      onSuccess: (saved) => {
        setValues((current) => ({ ...current, slug: saved.slug }));
        setErrors({});
        toast.success(mode === "create" ? "Organization created." : "Organization updated.");
      },
      onError: (error) => {
        setFormError(organizationErrorMessage((error as { message?: string })?.message));
      },
    });
  }

  const loading = organizationQuery.isLoading;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Organization"
        title={mode === "create" ? "Create your organization" : "Your organization profile"}
        description={
          mode === "create"
            ? "Establish a professional public identity for your organization, university, community group, or creative brand."
            : "Keep your organization’s public presence accurate and easy to find."
        }
        actions={
          existing ? (
            <Link to="/organizations/$slug" params={{ slug: existing.slug }}>
              <Button variant="outline">View public profile</Button>
            </Link>
          ) : null
        }
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : organizationQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load your organization profile.</span>
              <Button size="sm" variant="outline" onClick={() => void organizationQuery.refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <OrganizationForm
            mode={mode}
            values={values}
            onChange={setValues}
            onSubmit={handleSubmit}
            saving={save.isPending}
            formError={formError}
            logoPath={existing?.logo_path ?? null}
            errors={errors}
          />
        )}
      </div>
    </SiteLayout>
  );
}
