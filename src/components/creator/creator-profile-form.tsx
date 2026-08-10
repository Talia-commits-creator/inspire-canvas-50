import { useMemo, useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionToggleGroup } from "@/components/creator/option-toggle-group";
import {
  AVAILABILITY_OPTIONS,
  CREATOR_LIMITS,
  EXPERIENCE_OPTIONS,
  LINK_PLATFORMS,
  VISIBILITY_OPTIONS,
  normalizeLink,
  validateAbout,
  validateCreatorLocation,
  validateCreatorName,
  validateHeadline,
  validateLink,
  validateYears,
  type CategoryOption,
  type CreatorAvailability,
  type CreatorExperience,
  type CreatorLinks,
  type CreatorVisibility,
  type LinkPlatform,
  type SkillOption,
} from "@/lib/creator";
import type { CreatorProfileInput } from "@/hooks/use-creator";

export type CreatorFormValues = {
  creator_name: string;
  headline: string;
  about: string;
  primary_category_id: string;
  location: string;
  availability: CreatorAvailability;
  experience_level: CreatorExperience;
  years_experience: string;
  website: string;
  links: Record<LinkPlatform, string>;
  visibility: CreatorVisibility;
  categoryIds: string[];
  skillIds: string[];
};

export const EMPTY_LINKS = Object.fromEntries(
  LINK_PLATFORMS.map((p) => [p.key, ""]),
) as Record<LinkPlatform, string>;

export function emptyCreatorForm(): CreatorFormValues {
  return {
    creator_name: "",
    headline: "",
    about: "",
    primary_category_id: "",
    location: "",
    availability: "available",
    experience_level: "beginner",
    years_experience: "",
    website: "",
    links: { ...EMPTY_LINKS },
    visibility: "public",
    categoryIds: [],
    skillIds: [],
  };
}

type Errors = Partial<Record<string, string>>;

function validate(values: CreatorFormValues): Errors {
  const errors: Errors = {};
  const headline = validateHeadline(values.headline);
  if (headline) errors["headline"] = headline;
  const name = validateCreatorName(values.creator_name);
  if (name) errors["creator_name"] = name;
  const about = validateAbout(values.about);
  if (about) errors["about"] = about;
  const location = validateCreatorLocation(values.location);
  if (location) errors["location"] = location;
  const years = validateYears(values.years_experience);
  if (years) errors["years_experience"] = years;
  const website = validateLink(values.website);
  if (website) errors["website"] = website;
  if (!values.primary_category_id) errors["primary_category_id"] = "Choose your primary discipline.";
  if (values.categoryIds.length > CREATOR_LIMITS.categories.max)
    errors["categoryIds"] = `Choose up to ${CREATOR_LIMITS.categories.max} additional categories.`;
  if (values.skillIds.length > CREATOR_LIMITS.skills.max)
    errors["skillIds"] = `Choose up to ${CREATOR_LIMITS.skills.max} skills.`;
  for (const platform of LINK_PLATFORMS) {
    const message = validateLink(values.links[platform.key]);
    if (message) errors[`link-${platform.key}`] = message;
  }
  return errors;
}

export function toCreatorInput(values: CreatorFormValues): CreatorProfileInput {
  const links: CreatorLinks = {};
  for (const platform of LINK_PLATFORMS) {
    const value = normalizeLink(values.links[platform.key]);
    if (value) links[platform.key] = value;
  }
  return {
    creator_name: values.creator_name.trim() || null,
    headline: values.headline.trim(),
    about: values.about.trim() || null,
    primary_category_id: values.primary_category_id || null,
    location: values.location.trim() || null,
    availability: values.availability,
    experience_level: values.experience_level,
    years_experience: values.years_experience.trim() ? Number(values.years_experience.trim()) : null,
    website: normalizeLink(values.website) || null,
    links,
    visibility: values.visibility,
    categoryIds: values.categoryIds,
    skillIds: values.skillIds,
  };
}

const STEPS = [
  { id: "identity", title: "Creative identity", description: "How you introduce your work." },
  { id: "about", title: "About your work", description: "Your introduction and experience." },
  { id: "skills", title: "Skills", description: "What you actually do on a project." },
  { id: "presence", title: "Availability and links", description: "Where people can find you." },
  { id: "visibility", title: "Visibility", description: "Who can see your creator profile." },
] as const;

export function CreatorProfileForm({
  mode,
  values,
  onChange,
  categories,
  skills,
  onSubmit,
  saving,
  formError,
}: {
  mode: "create" | "edit";
  values: CreatorFormValues;
  onChange: (next: CreatorFormValues) => void;
  categories: CategoryOption[];
  skills: SkillOption[];
  onSubmit: (values: CreatorFormValues) => void;
  saving: boolean;
  formError: string | null;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const isWizard = mode === "create";

  const additionalCategories = useMemo(
    () => categories.filter((category) => category.id !== values.primary_category_id),
    [categories, values.primary_category_id],
  );

  function set<K extends keyof CreatorFormValues>(key: K, value: CreatorFormValues[K]) {
    onChange({ ...values, [key]: value });
    setErrors((previous) => ({ ...previous, [key as string]: undefined }));
  }

  function toggle(key: "categoryIds" | "skillIds", id: string, max: number) {
    const current = values[key];
    const next = current.includes(id)
      ? current.filter((value) => value !== id)
      : current.length >= max
        ? current
        : [...current, id];
    set(key, next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (isWizard) setStep(0);
      const first = document.querySelector<HTMLElement>("[data-invalid='true']");
      first?.focus();
      return;
    }
    onSubmit(values);
  }

  const identitySection = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={values.headline}
          maxLength={CREATOR_LIMITS.headline.max}
          placeholder="Photographer & visual storyteller"
          aria-invalid={Boolean(errors["headline"])}
          data-invalid={Boolean(errors["headline"])}
          aria-describedby="headline-help"
          onChange={(event) => set("headline", event.target.value)}
        />
        <p id="headline-help" className="text-sm text-muted-foreground">
          A short line that sums up your craft. {values.headline.length}/{CREATOR_LIMITS.headline.max}
        </p>
        {errors["headline"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["headline"]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="creator_name">Creator name (optional)</Label>
        <Input
          id="creator_name"
          value={values.creator_name}
          maxLength={CREATOR_LIMITS.creatorName.max}
          placeholder="The name you perform or publish under"
          aria-invalid={Boolean(errors["creator_name"])}
          onChange={(event) => set("creator_name", event.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Leave blank to use the display name from your profile.
        </p>
        {errors["creator_name"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["creator_name"]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary_category">Primary category</Label>
        <Select
          value={values.primary_category_id}
          onValueChange={(value) => set("primary_category_id", value)}
        >
          <SelectTrigger id="primary_category" aria-invalid={Boolean(errors["primary_category_id"])}>
            <SelectValue placeholder="Choose your main discipline" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors["primary_category_id"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["primary_category_id"]}
          </p>
        ) : null}
      </div>

      <OptionToggleGroup
        id="additional-categories"
        legend="Additional categories"
        description="Other disciplines you work across."
        options={additionalCategories}
        selected={values.categoryIds.filter((id) => id !== values.primary_category_id)}
        onToggle={(id) => toggle("categoryIds", id, CREATOR_LIMITS.categories.max)}
        max={CREATOR_LIMITS.categories.max}
        {...(errors["categoryIds"] ? { error: errors["categoryIds"] } : {})}
      />
    </div>
  );

  const aboutSection = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="about">Introduction</Label>
        <Textarea
          id="about"
          rows={7}
          value={values.about}
          maxLength={CREATOR_LIMITS.about.max}
          placeholder="What you create, the kind of work you take on, and what makes it yours."
          aria-invalid={Boolean(errors["about"])}
          onChange={(event) => set("about", event.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          {values.about.length}/{CREATOR_LIMITS.about.max}
        </p>
        {errors["about"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["about"]}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Experience level</legend>
        <RadioGroup
          value={values.experience_level}
          onValueChange={(value) => set("experience_level", value as CreatorExperience)}
          className="grid gap-3"
        >
          {EXPERIENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`experience-${option.value}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3"
            >
              <RadioGroupItem id={`experience-${option.value}`} value={option.value} className="mt-1" />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-sm text-muted-foreground">{option.hint}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="years_experience">Years of experience (optional)</Label>
        <Input
          id="years_experience"
          inputMode="numeric"
          value={values.years_experience}
          placeholder="4"
          className="max-w-32"
          aria-invalid={Boolean(errors["years_experience"])}
          onChange={(event) => set("years_experience", event.target.value)}
        />
        {errors["years_experience"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["years_experience"]}
          </p>
        ) : null}
      </div>
    </div>
  );

  const skillsSection = (
    <OptionToggleGroup
      id="skills"
      legend="Skills"
      description="Pick the skills that describe the work you deliver."
      options={skills}
      selected={values.skillIds}
      onToggle={(id) => toggle("skillIds", id, CREATOR_LIMITS.skills.max)}
      max={CREATOR_LIMITS.skills.max}
      {...(errors["skillIds"] ? { error: errors["skillIds"] } : {})}
    />
  );

  const presenceSection = (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Availability</legend>
        <RadioGroup
          value={values.availability}
          onValueChange={(value) => set("availability", value as CreatorAvailability)}
          className="grid gap-3"
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`availability-${option.value}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3"
            >
              <RadioGroupItem id={`availability-${option.value}`} value={option.value} className="mt-1" />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-sm text-muted-foreground">{option.hint}</span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="creator_location">Where you work from (optional)</Label>
        <Input
          id="creator_location"
          value={values.location}
          maxLength={CREATOR_LIMITS.location.max}
          placeholder="Manchester, UK"
          aria-invalid={Boolean(errors["location"])}
          onChange={(event) => set("location", event.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          A general location only. Leave blank to use the location on your profile.
        </p>
        {errors["location"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["location"]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="creator_website">Professional website (optional)</Label>
        <Input
          id="creator_website"
          value={values.website}
          placeholder="yourstudio.com"
          aria-invalid={Boolean(errors["website"])}
          onChange={(event) => set("website", event.target.value)}
        />
        {errors["website"] ? (
          <p className="text-sm text-destructive" role="alert">
            {errors["website"]}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Professional links (optional)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {LINK_PLATFORMS.map((platform) => (
            <div key={platform.key} className="space-y-1.5">
              <Label htmlFor={`link-${platform.key}`} className="text-sm font-normal">
                {platform.label}
              </Label>
              <Input
                id={`link-${platform.key}`}
                value={values.links[platform.key]}
                placeholder="https://"
                aria-invalid={Boolean(errors[`link-${platform.key}`])}
                onChange={(event) =>
                  set("links", { ...values.links, [platform.key]: event.target.value })
                }
              />
              {errors[`link-${platform.key}`] ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors[`link-${platform.key}`]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  );

  const visibilitySection = (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Creator profile visibility</legend>
      <RadioGroup
        value={values.visibility}
        onValueChange={(value) => set("visibility", value as CreatorVisibility)}
        className="grid gap-3"
      >
        {VISIBILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            htmlFor={`visibility-${option.value}`}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3"
          >
            <RadioGroupItem id={`visibility-${option.value}`} value={option.value} className="mt-1" />
            <span>
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="block text-sm text-muted-foreground">{option.hint}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );

  const sections = [identitySection, aboutSection, skillsSection, presenceSection, visibilitySection];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {isWizard ? (
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Step {step + 1} of {STEPS.length}
            </p>
            <CardTitle className="font-display text-xl">{STEPS[step]!.title}</CardTitle>
            <CardDescription>{STEPS[step]!.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections[step]}
            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={() => setStep((value) => value + 1)}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating profile…" : "Create creator profile"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {STEPS.map((section, index) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="font-display text-xl">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>{sections[index]}</CardContent>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
