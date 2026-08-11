import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { OptionToggleGroup } from "@/components/creator/option-toggle-group";
import {
  COVER_RULES,
  MEDIA_RULES,
  MEDIA_TYPE_OPTIONS,
  PORTFOLIO_LIMITS,
  PORTFOLIO_VISIBILITY_OPTIONS,
  normalizeUrl,
  validateDescription,
  validateExternalUrl,
  validateMediaFile,
  validateTitle,
  type PortfolioCategory,
  type PortfolioItem,
  type PortfolioMediaType,
  type PortfolioVisibility,
} from "@/lib/portfolio";

export type PortfolioFormValues = {
  title: string;
  description: string;
  media_type: PortfolioMediaType;
  category_id: string;
  external_url: string;
  visibility: PortfolioVisibility;
  is_featured: boolean;
};

export const emptyPortfolioForm: PortfolioFormValues = {
  title: "",
  description: "",
  media_type: "image",
  category_id: "",
  external_url: "",
  visibility: "public",
  is_featured: false,
};

export function toFormValues(item: PortfolioItem): PortfolioFormValues {
  return {
    title: item.title,
    description: item.description ?? "",
    media_type: item.media_type,
    category_id: item.category_id ?? "",
    external_url: item.external_url ?? "",
    visibility: item.visibility,
    is_featured: item.is_featured,
  };
}

export type PortfolioSubmitPayload = {
  values: PortfolioFormValues;
  mediaFile: File | null;
  coverFile: File | null;
};

function FileField({
  id,
  label,
  hint,
  accept,
  file,
  currentLabel,
  onSelect,
  error,
}: {
  id: string;
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  currentLabel: string | null;
  onSelect: (file: File | null) => void;
  error?: string | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          onSelect(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {file || currentLabel ? "Replace file" : "Choose file"}
        </Button>
        <span className="min-w-0 truncate text-sm text-muted-foreground">
          {file ? file.name : (currentLabel ?? "No file selected")}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PortfolioItemForm({
  mode,
  values,
  onChange,
  categories,
  existing,
  onSubmit,
  onCancel,
  saving,
  progressLabel,
  formError,
  featuredFull,
}: {
  mode: "create" | "edit";
  values: PortfolioFormValues;
  onChange: (values: PortfolioFormValues) => void;
  categories: PortfolioCategory[];
  existing: PortfolioItem | null;
  onSubmit: (payload: PortfolioSubmitPayload) => void;
  onCancel: () => void;
  saving: boolean;
  progressLabel: string | null;
  formError: string | null;
  featuredFull: boolean;
}) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const isLink = values.media_type === "link";
  const uploadKind = values.media_type as Exclude<PortfolioMediaType, "link">;

  function set<K extends keyof PortfolioFormValues>(key: K, value: PortfolioFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string | undefined> = {
      title: validateTitle(values.title),
      description: validateDescription(values.description),
      external_url: validateExternalUrl(values.external_url, isLink),
    };
    if (!isLink) {
      if (mediaFile) next["media"] = validateMediaFile(mediaFile, uploadKind);
      else if (!existing?.media_path) next["media"] = "Upload the file for this work.";
    }
    if (coverFile) next["cover"] = validateMediaFile(coverFile, "cover");
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onSubmit({ values, mediaFile, coverFile });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {mode === "create" ? (
        <OptionToggleGroup
          id="portfolio-media-type"
          legend="What kind of work is this?"
          description="The form adapts to the format you choose."
          options={MEDIA_TYPE_OPTIONS.map((option) => ({ id: option.value, name: option.label }))}
          selected={[values.media_type]}
          onToggle={(id) => {
            setMediaFile(null);
            set("media_type", id as PortfolioMediaType);
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Format: <span className="font-medium text-foreground">
            {MEDIA_TYPE_OPTIONS.find((option) => option.value === values.media_type)?.label}
          </span>{" "}
          — the format is fixed once a piece exists. You can still replace the file.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="portfolio-title">Title</Label>
        <Input
          id="portfolio-title"
          value={values.title}
          maxLength={PORTFOLIO_LIMITS.title.max}
          onChange={(event) => set("title", event.target.value)}
          aria-invalid={Boolean(errors["title"])}
          aria-describedby={errors["title"] ? "portfolio-title-error" : undefined}
        />
        {errors["title"] ? (
          <p id="portfolio-title-error" className="text-sm text-destructive" role="alert">
            {errors["title"]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-description">Description</Label>
        <Textarea
          id="portfolio-description"
          rows={4}
          value={values.description}
          maxLength={PORTFOLIO_LIMITS.description.max}
          placeholder="A short note about the work, the brief or how it came together."
          onChange={(event) => set("description", event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {values.description.trim().length}/{PORTFOLIO_LIMITS.description.max} characters. Optional.
        </p>
        {errors["description"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["description"]}
          </p>
        ) : null}
      </div>

      {!isLink ? (
        <FileField
          id="portfolio-media"
          label="Media file"
          hint={MEDIA_RULES[uploadKind].label}
          accept={MEDIA_RULES[uploadKind].accept}
          file={mediaFile}
          currentLabel={existing?.media_path ? "Current file uploaded" : null}
          onSelect={setMediaFile}
          error={errors["media"]}
        />
      ) : null}

      {values.media_type !== "image" ? (
        <FileField
          id="portfolio-cover"
          label="Cover image"
          hint={`Optional. Shown in listings. ${COVER_RULES.label}`}
          accept={COVER_RULES.accept}
          file={coverFile}
          currentLabel={existing?.thumbnail_path ? "Current cover uploaded" : null}
          onSelect={setCoverFile}
          error={errors["cover"]}
        />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="portfolio-url">{isLink ? "Link to the work" : "External link"}</Label>
        <Input
          id="portfolio-url"
          inputMode="url"
          placeholder="https://"
          value={values.external_url}
          onChange={(event) => set("external_url", event.target.value)}
          onBlur={(event) => set("external_url", normalizeUrl(event.target.value))}
          aria-invalid={Boolean(errors["external_url"])}
        />
        <p className="text-xs text-muted-foreground">
          {isLink ? "Where this work lives." : "Optional. Where people can see more of this work."}
        </p>
        {errors["external_url"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["external_url"]}
          </p>
        ) : null}
      </div>

      <OptionToggleGroup
        id="portfolio-category"
        legend="Category"
        description="Pick the one category that fits this piece best."
        options={categories.map((category) => ({ id: category.id, name: category.name }))}
        selected={values.category_id ? [values.category_id] : []}
        onToggle={(id) => set("category_id", values.category_id === id ? "" : id)}
      />

      <OptionToggleGroup
        id="portfolio-visibility"
        legend="Visibility"
        description={
          values.visibility === "public"
            ? "Shown on your public creator profile."
            : "Only you can see it."
        }
        options={PORTFOLIO_VISIBILITY_OPTIONS.map((option) => ({
          id: option.value,
          name: option.label,
        }))}
        selected={[values.visibility]}
        onToggle={(id) => set("visibility", id as PortfolioVisibility)}
      />

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
        <div className="space-y-1">
          <Label htmlFor="portfolio-featured">Feature this work</Label>
          <p className="text-xs text-muted-foreground">
            Featured work leads your public profile. Up to {PORTFOLIO_LIMITS.featured.max} pieces.
          </p>
        </div>
        <Switch
          id="portfolio-featured"
          checked={values.is_featured}
          disabled={featuredFull && !values.is_featured}
          onCheckedChange={(checked) => set("is_featured", checked)}
        />
      </div>

      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="submit" disabled={saving}>
          {saving ? (progressLabel ?? "Saving…") : mode === "create" ? "Add to portfolio" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {saving ? (progressLabel ?? "Saving") : ""}
      </p>
    </form>
  );
}
