export type Profile = {
  id: string;
  display_name: string | null;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicProfile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  created_at: string;
};

export const PROFILE_LIMITS = {
  displayName: { min: 2, max: 60 },
  username: { min: 3, max: 30 },
  bio: { max: 500 },
  location: { max: 100 },
  website: { max: 200 },
} as const;

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Mirrors the database reserved_usernames table for fast inline feedback. */
export const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "dashboard", "login", "logout", "register",
  "settings", "api", "styleguide", "creators", "creator", "organizations",
  "organization", "projects", "project", "community", "discover", "about",
  "contact", "profile", "profiles", "user", "users", "account", "accounts",
  "auth", "signin", "signup", "sitemap", "robots", "static", "assets",
  "support", "help", "inspiretoaspire", "root", "system", "null", "undefined",
  "forgot-password", "reset-password", "home", "search", "explore",
]);

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validateUsername(raw: string): string | undefined {
  const value = normalizeUsername(raw);
  if (!value) return "Choose a username.";
  if (value.length < PROFILE_LIMITS.username.min)
    return `Usernames need at least ${PROFILE_LIMITS.username.min} characters.`;
  if (value.length > PROFILE_LIMITS.username.max)
    return `Usernames can be at most ${PROFILE_LIMITS.username.max} characters.`;
  if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(value))
    return "Use letters, numbers, hyphens and underscores. Start and end with a letter or number.";
  if (RESERVED_USERNAMES.has(value)) return "That username is reserved. Please choose another.";
  return undefined;
}

export function validateDisplayName(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Add a display name so people know who you are.";
  if (value.length < PROFILE_LIMITS.displayName.min) return "Display name is too short.";
  if (value.length > PROFILE_LIMITS.displayName.max)
    return `Display name can be at most ${PROFILE_LIMITS.displayName.max} characters.`;
  return undefined;
}

export function validateBio(raw: string): string | undefined {
  if (raw.trim().length > PROFILE_LIMITS.bio.max)
    return `Bio can be at most ${PROFILE_LIMITS.bio.max} characters.`;
  return undefined;
}

export function validateLocation(raw: string): string | undefined {
  if (raw.trim().length > PROFILE_LIMITS.location.max)
    return `Location can be at most ${PROFILE_LIMITS.location.max} characters.`;
  return undefined;
}

export function normalizeWebsite(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function validateWebsite(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  const withScheme = normalizeWebsite(value);
  if (withScheme.length > PROFILE_LIMITS.website.max) return "That link is too long.";
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return "Enter a valid http or https link.";
    if (!url.hostname.includes(".")) return "Enter a valid website address.";
  } catch {
    return "Enter a valid website address.";
  }
  return undefined;
}

const COMPLETION_FIELDS = ["display_name", "username", "avatar_url", "bio", "location", "website"] as const;

export function profileCompletion(profile: Pick<Profile, (typeof COMPLETION_FIELDS)[number]> | null) {
  if (!profile) return { completed: 0, total: COMPLETION_FIELDS.length, percent: 0, missing: [...COMPLETION_FIELDS] as string[] };
  const missing = COMPLETION_FIELDS.filter((field) => {
    const value = profile[field];
    return !value || String(value).trim().length === 0;
  });
  const completed = COMPLETION_FIELDS.length - missing.length;
  return {
    completed,
    total: COMPLETION_FIELDS.length,
    percent: Math.round((completed / COMPLETION_FIELDS.length) * 100),
    missing: missing as unknown as string[],
  };
}

export const PROFILE_FIELD_LABELS: Record<string, string> = {
  display_name: "Display name",
  username: "Username",
  avatar_url: "Profile photo",
  bio: "Bio",
  location: "Location",
  website: "Website",
};

export function profileErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("profiles_username_unique") || raw.includes("profiles_username_lower_idx") || raw.includes("duplicate key"))
    return "That username is already taken. Try another one.";
  if (raw.includes("reserved_username")) return "That username is reserved. Please choose another.";
  if (raw.includes("profiles_username_format")) return "That username contains characters we can't use.";
  if (raw.includes("profiles_website_format")) return "Enter a valid website address.";
  if (raw.includes("profiles_bio_length")) return "Your bio is too long.";
  if (raw.includes("profiles_display_name_length")) return "Your display name length is out of range.";
  if (raw.includes("jwt") || raw.includes("session")) return "Your session expired. Please log in again.";
  if (raw.includes("failed to fetch") || raw.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  if (!raw) return "Something went wrong. Please try again.";
  return "We couldn't save your profile. Please try again.";
}

export function initialsFrom(displayName: string | null | undefined, username: string) {
  const source = (displayName ?? username).trim();
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || username.slice(0, 2).toUpperCase();
}
