import { normalizeWebsite, validateWebsite } from "@/lib/profile";

export type OrganizationVisibility = "public" | "private";

export type OrganizationLinks = Partial<Record<
  "website" | "linkedin" | "instagram" | "x" | "facebook" | "youtube" | "bluesky",
  string
>>;

export type Organization = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_path: string | null;
  short_description: string;
  description: string | null;
  organization_type: string;
  location: string | null;
  website: string | null;
  links: OrganizationLinks;
  visibility: OrganizationVisibility;
  created_at: string;
  updated_at: string;
};

export type PublicOrganization = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  short_description: string;
  description: string | null;
  organization_type: string;
  location: string | null;
  website: string | null;
  links: OrganizationLinks;
  visibility: OrganizationVisibility;
  created_at: string;
  updated_at: string;
};

export type OrganizationListItem = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  short_description: string;
  organization_type: string;
  location: string | null;
  visibility: OrganizationVisibility;
  created_at: string;
};

export const ORGANIZATION_LINK_KEYS = [
  { key: "website", label: "Website" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "bluesky", label: "Bluesky" },
] as const;

export const EMPTY_ORGANIZATION_LINKS: Record<(typeof ORGANIZATION_LINK_KEYS)[number]["key"], string> = {
  website: "",
  linkedin: "",
  instagram: "",
  x: "",
  facebook: "",
  youtube: "",
  bluesky: "",
};

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function validateOrganizationName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Add your organization name.";
  if (trimmed.length < 2) return "Organization name is too short.";
  if (trimmed.length > 120) return "Organization name can be at most 120 characters.";
  return undefined;
}

export function validateOrganizationSlug(value: string): string | undefined {
  const trimmed = normalizeSlug(value);
  if (!trimmed) return "Add a unique organization slug.";
  if (trimmed.length < 2) return "Slug must be at least 2 characters.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed))
    return "Use lowercase letters, numbers, and hyphens only.";
  return undefined;
}

export function validateOrganizationType(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Choose an organization type.";
  if (trimmed.length < 2) return "Organization type is too short.";
  if (trimmed.length > 80) return "Organization type can be at most 80 characters.";
  return undefined;
}

export function validateShortDescription(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Add a short description.";
  if (trimmed.length > 180) return "Short description can be at most 180 characters.";
  return undefined;
}

export function validateDescription(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > 5000) return "Description can be at most 5000 characters.";
  return undefined;
}

export function validateOrganizationLocation(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > 120) return "Location can be at most 120 characters.";
  return undefined;
}

export function validateOrganizationLinks(raw: OrganizationLinks): string | undefined {
  for (const key of ORGANIZATION_LINK_KEYS) {
    const value = (raw[key.key] ?? "").trim();
    if (!value) continue;
    const normalized = key.key === "website" ? normalizeWebsite(value) : normalizeWebsite(value);
    if (normalized.length > 200) return "One of your links is too long.";
    const siteError = validateWebsite(normalized);
    if (siteError) return siteError;
  }
  return undefined;
}

export function sanitizeOrganizationLinks(raw: OrganizationLinks): OrganizationLinks {
  const next: OrganizationLinks = {};
  for (const key of ORGANIZATION_LINK_KEYS) {
    const value = (raw[key.key] ?? "").trim();
    if (!value) continue;
    next[key.key] = normalizeWebsite(value);
  }
  return next;
}

export function organizationErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("duplicate key") || raw.includes("organizations_slug"))
    return "That organization slug is already in use. Try another one.";
  if (raw.includes("constraint") && raw.includes("slug"))
    return "That organization slug is invalid. Use letters, numbers and hyphens only.";
  if (raw.includes("jwt") || raw.includes("session")) return "Your session expired. Please log in again.";
  if (raw.includes("failed to fetch") || raw.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  if (!raw) return "We couldn't save your organization. Please try again.";
  return "We couldn't save your organization. Please try again.";
}
