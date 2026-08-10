/**
 * Creator profile domain rules.
 *
 * The universal profile answers "who is this user?".  Everything here answers
 * "what does this person create?" — it never duplicates auth, avatar, username
 * or display name.
 */

export const CREATOR_LIMITS = {
  creatorName: { max: 80 },
  headline: { min: 3, max: 90 },
  about: { max: 1200 },
  location: { max: 100 },
  website: { max: 200 },
  categories: { max: 5 },
  skills: { max: 12 },
  years: { min: 0, max: 70 },
} as const;

export type CreatorAvailability = "available" | "limited" | "unavailable";
export type CreatorExperience = "beginner" | "intermediate" | "experienced" | "professional";
export type CreatorVisibility = "public" | "private";

export const AVAILABILITY_OPTIONS: { value: CreatorAvailability; label: string; hint: string }[] = [
  { value: "available", label: "Available", hint: "Open to new work right now." },
  { value: "limited", label: "Limited availability", hint: "Taking on selected work only." },
  { value: "unavailable", label: "Not currently available", hint: "Not accepting work at the moment." },
];

export const EXPERIENCE_OPTIONS: { value: CreatorExperience; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "Starting out and building a body of work." },
  { value: "intermediate", label: "Intermediate", hint: "Some paid or released work behind you." },
  { value: "experienced", label: "Experienced", hint: "Regular work across a range of briefs." },
  { value: "professional", label: "Professional", hint: "This is your full-time craft." },
];

export const VISIBILITY_OPTIONS: { value: CreatorVisibility; label: string; hint: string }[] = [
  { value: "public", label: "Public", hint: "Anyone can find and view your creator profile." },
  { value: "private", label: "Private", hint: "Only you can see it. It stays out of discovery." },
];

export const AVAILABILITY_LABELS: Record<CreatorAvailability, string> = {
  available: "Available",
  limited: "Limited availability",
  unavailable: "Not currently available",
};

export const EXPERIENCE_LABELS: Record<CreatorExperience, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  experienced: "Experienced",
  professional: "Professional",
};

export const LINK_PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "behance", label: "Behance" },
  { key: "other", label: "Other platform" },
] as const;

export type LinkPlatform = (typeof LINK_PLATFORMS)[number]["key"];
export type CreatorLinks = Partial<Record<LinkPlatform, string>>;

export type CategoryOption = { id: string; slug: string; name: string };
export type SkillOption = { id: string; slug: string; name: string };

export type CreatorProfile = {
  id: string;
  user_id: string;
  creator_name: string | null;
  headline: string;
  about: string | null;
  primary_category_id: string | null;
  location: string | null;
  availability: CreatorAvailability;
  experience_level: CreatorExperience;
  years_experience: number | null;
  website: string | null;
  links: CreatorLinks;
  visibility: CreatorVisibility;
  created_at: string;
  updated_at: string;
};

export type PublicCreatorProfile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  profile_location: string | null;
  profile_website: string | null;
  profile_bio: string | null;
  creator: {
    id: string;
    creator_name: string | null;
    headline: string;
    about: string | null;
    location: string | null;
    availability: CreatorAvailability;
    experience_level: CreatorExperience;
    years_experience: number | null;
    website: string | null;
    links: CreatorLinks;
    created_at: string;
    primary_category: { slug: string; name: string } | null;
    categories: { slug: string; name: string }[];
    skills: { slug: string; name: string }[];
  };
};

export type CreatorListItem = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  creator_name: string | null;
  headline: string;
  location: string | null;
  availability: CreatorAvailability;
  experience_level: CreatorExperience;
  primary_category: string | null;
  created_at: string;
};

/* ---------- validation ---------- */

export function normalizeLink(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function validateLink(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  const withScheme = normalizeLink(value);
  if (withScheme.length > CREATOR_LIMITS.website.max) return "That link is too long.";
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return "Enter a valid http or https link.";
    if (!url.hostname.includes(".")) return "Enter a valid link.";
  } catch {
    return "Enter a valid link.";
  }
  return undefined;
}

export function validateHeadline(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Add a headline so people know what you do.";
  if (value.length < CREATOR_LIMITS.headline.min) return "That headline is too short.";
  if (value.length > CREATOR_LIMITS.headline.max)
    return `Keep your headline to ${CREATOR_LIMITS.headline.max} characters or fewer.`;
  return undefined;
}

export function validateAbout(raw: string): string | undefined {
  if (raw.trim().length > CREATOR_LIMITS.about.max)
    return `Keep your introduction to ${CREATOR_LIMITS.about.max} characters or fewer.`;
  return undefined;
}

export function validateCreatorName(raw: string): string | undefined {
  if (raw.trim().length > CREATOR_LIMITS.creatorName.max) return "That creator name is too long.";
  return undefined;
}

export function validateCreatorLocation(raw: string): string | undefined {
  if (raw.trim().length > CREATOR_LIMITS.location.max) return "That location is too long.";
  return undefined;
}

export function validateYears(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (!/^\d{1,2}$/.test(value)) return "Enter a whole number of years.";
  const years = Number(value);
  if (years < CREATOR_LIMITS.years.min || years > CREATOR_LIMITS.years.max)
    return `Enter between ${CREATOR_LIMITS.years.min} and ${CREATOR_LIMITS.years.max} years.`;
  return undefined;
}

export function creatorErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("creator_profiles_user_id_key") || raw.includes("duplicate key"))
    return "You already have a creator profile. Edit the one you have instead.";
  if (raw.includes("creator_headline_length")) return "Your headline length is out of range.";
  if (raw.includes("creator_about_length")) return "Your introduction is too long.";
  if (raw.includes("row-level security") || raw.includes("permission"))
    return "You can only change your own creator profile.";
  if (raw.includes("jwt") || raw.includes("session")) return "Your session expired. Please log in again.";
  if (raw.includes("failed to fetch") || raw.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  if (!raw) return "Something went wrong. Please try again.";
  return "We couldn't save your creator profile. Please try again.";
}

export function creatorDisplayName(
  creatorName: string | null | undefined,
  displayName: string | null | undefined,
  username: string,
) {
  return creatorName?.trim() || displayName?.trim() || username;
}
