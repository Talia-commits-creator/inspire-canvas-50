import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationLogoUrl, useUploadOrganizationLogo, validateOrganizationLogoFile } from "@/hooks/use-organization";
import {
  EMPTY_ORGANIZATION_LINKS,
  ORGANIZATION_LINK_KEYS,
  normalizeSlug,
  sanitizeOrganizationLinks,
  validateDescription,
  validateOrganizationLinks,
  validateOrganizationLocation,
  validateOrganizationName,
  validateOrganizationSlug,
  validateOrganizationType,
  validateShortDescription,
  type OrganizationLinks,
} from "@/lib/organization";

export type OrganizationFormValues = {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  organization_type: string;
  location: string;
  website: string;
  links: OrganizationLinks;
  visibility: "public" | "private";
};

export const emptyOrganizationForm: OrganizationFormValues = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  organization_type: "",
  location: "",
  website: "",
  links: { ...EMPTY_ORGANIZATION_LINKS },
  visibility: "private",
};

export function toOrganizationInput(values: OrganizationFormValues) {
  return {
    name: values.name.trim(),
    slug: normalizeSlug(values.slug),
    short_description: values.short_description.trim(),
    description: values.description.trim() || null,
    organization_type: values.organization_type.trim(),
    location: values.location.trim() || null,
    website: values.website.trim() ? values.website.trim() : null,
    links: sanitizeOrganizationLinks(values.links),
    visibility: values.visibility,
  };
}

export function validateOrganizationForm(values: OrganizationFormValues) {
  const errors: Partial<Record<keyof OrganizationFormValues, string>> = {};
  const nameError = validateOrganizationName(values.name);
  if (nameError) errors.name = nameError;
  const slugError = validateOrganizationSlug(values.slug);
  if (slugError) errors.slug = slugError;
  const shortDescriptionError = validateShortDescription(values.short_description);
  if (shortDescriptionError) errors.short_description = shortDescriptionError;
  const descriptionError = validateDescription(values.description);
  if (descriptionError) errors.description = descriptionError;
  const typeError = validateOrganizationType(values.organization_type);
  if (typeError) errors.organization_type = typeError;
  const locationError = validateOrganizationLocation(values.location);
  if (locationError) errors.location = locationError;
  const linksError = validateOrganizationLinks(values.links);
  if (linksError) errors.links = linksError;
  return errors;
}

export function OrganizationLogoUploader({
  logoPath,
  name,
}: {
  logoPath: string | null;
  name: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: signedUrl, isLoading: loadingUrl } = useOrganizationLogoUrl(logoPath);
  const upload = useUploadOrganizationLogo();
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const invalid = validateOrganizationLogoFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    try {
      await upload.mutateAsync(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't upload the logo.");
    }
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ORG";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
        {logoPath && signedUrl ? (
          <img src={signedUrl} alt={`${name} logo`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-xl font-semibold text-muted-foreground">
            {loadingUrl && logoPath ? "" : initials}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
          <Camera aria-hidden />
          {upload.isPending ? "Uploading…" : logoPath ? "Replace logo" : "Upload logo"}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Up to 2 MB.</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}

export function OrganizationForm({
  values,
  onChange,
  onSubmit,
  saving,
  mode,
  formError,
  logoPath,
  errors,
}: {
  values: OrganizationFormValues;
  onChange: (next: OrganizationFormValues) => void;
  onSubmit: () => void;
  saving: boolean;
  mode: "create" | "edit";
  formError: string | null;
  logoPath: string | null;
  errors: Partial<Record<keyof OrganizationFormValues, string>>;
}) {
  function set<K extends keyof OrganizationFormValues>(key: K, value: OrganizationFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Branding</CardTitle>
          <CardDescription>Use a clear logo that feels trustworthy and recognizable.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationLogoUploader logoPath={logoPath} name={values.name || "Organization"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Organization details</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Create the public identity for your organization."
              : "Keep your public identity up to date and visible to the community."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {formError ? (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization name</Label>
            <Input
              id="organization_name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Northlight Studio"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_slug">Public slug</Label>
            <Input
              id="organization_slug"
              value={values.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase())}
              placeholder="northlight-studio"
              aria-invalid={Boolean(errors.slug)}
            />
            <p className="text-xs text-muted-foreground">This becomes part of your public profile URL.</p>
            {errors.slug ? <p className="text-sm text-destructive">{errors.slug}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_type">Organization type</Label>
            <Input
              id="organization_type"
              value={values.organization_type}
              onChange={(e) => set("organization_type", e.target.value)}
              placeholder="University, studio, community group, agency..."
              aria-invalid={Boolean(errors.organization_type)}
            />
            {errors.organization_type ? (
              <p className="text-sm text-destructive">{errors.organization_type}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Short description</Label>
            <Textarea
              id="short_description"
              rows={3}
              value={values.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              placeholder="A creative organization supporting emerging talent and collaborative projects."
              aria-invalid={Boolean(errors.short_description)}
            />
            {errors.short_description ? (
              <p className="text-sm text-destructive">{errors.short_description}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full description</Label>
            <Textarea
              id="description"
              rows={6}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell people what your organization does, who it serves and what kind of partnerships it values."
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description ? <p className="text-sm text-destructive">{errors.description}</p> : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={values.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Manchester, UK"
                aria-invalid={Boolean(errors.location)}
              />
              {errors.location ? <p className="text-sm text-destructive">{errors.location}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={values.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://example.org"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={values.visibility}
              onChange={(e) => set("visibility", e.target.value as "public" | "private")}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label>Public links</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {ORGANIZATION_LINK_KEYS.map((platform) => (
                <div key={platform.key} className="space-y-2">
                  <Label htmlFor={`link-${platform.key}`}>{platform.label}</Label>
                  <Input
                    id={`link-${platform.key}`}
                    value={values.links[platform.key] ?? ""}
                    onChange={(e) =>
                      set("links", {
                        ...values.links,
                        [platform.key]: e.target.value,
                      })
                    }
                    placeholder={platform.label === "Website" ? "https://..." : "https://..."}
                  />
                </div>
              ))}
            </div>
            {errors.links ? <p className="text-sm text-destructive">{errors.links}</p> : null}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={onSubmit} disabled={saving}>
              {saving ? (mode === "create" ? "Creating…" : "Saving…") : mode === "create" ? "Create organization" : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
