/**
 * Creator portfolio domain rules.
 *
 * The creator profile answers "what do you create?".  A portfolio item answers
 * "what have you created?".  Portfolio items never duplicate universal profile
 * or creator profile information — they always reference the creator profile.
 */

export type PortfolioMediaType = "image" | "video" | "audio" | "link";
export type PortfolioVisibility = "public" | "private";

export const PORTFOLIO_LIMITS = {
  title: { min: 2, max: 120 },
  description: { max: 1200 },
  externalUrl: { max: 500 },
  featured: { max: 6 },
  items: { max: 60 },
} as const;

export const MEDIA_TYPE_OPTIONS: {
  value: PortfolioMediaType;
  label: string;
  hint: string;
}[] = [
  { value: "image", label: "Image", hint: "Photography, design, artwork or a still frame." },
  { value: "video", label: "Video", hint: "A short film, reel or performance clip." },
  { value: "audio", label: "Audio", hint: "A mix, track, voice reel or podcast episode." },
  { value: "link", label: "External link", hint: "Work that already lives somewhere else." },
];

export const MEDIA_TYPE_LABELS: Record<PortfolioMediaType, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  link: "External link",
};

export const PORTFOLIO_VISIBILITY_OPTIONS: {
  value: PortfolioVisibility;
  label: string;
  hint: string;
}[] = [
  { value: "public", label: "Public", hint: "Shown on your public creator profile." },
  { value: "private", label: "Private", hint: "Only you can see it." },
];

/* ---------- supported media ---------- */

export const MEDIA_RULES: Record<
  Exclude<PortfolioMediaType, "link">,
  { types: string[]; accept: string; maxBytes: number; label: string }
> = {
  image: {
    types: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    accept: "image/jpeg,image/png,image/webp,image/avif",
    maxBytes: 8 * 1024 * 1024,
    label: "JPG, PNG, WebP or AVIF. Up to 8 MB.",
  },
  video: {
    types: ["video/mp4", "video/webm", "video/quicktime"],
    accept: "video/mp4,video/webm,video/quicktime",
    maxBytes: 100 * 1024 * 1024,
    label: "MP4, WebM or MOV. Up to 100 MB.",
  },
  audio: {
    types: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/aac", "audio/ogg"],
    accept: "audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg",
    maxBytes: 30 * 1024 * 1024,
    label: "MP3, WAV, M4A, AAC or OGG. Up to 30 MB.",
  },
};

export const COVER_RULES = {
  types: ["image/jpeg", "image/png", "image/webp"],
  accept: "image/jpeg,image/png,image/webp",
  maxBytes: 4 * 1024 * 1024,
  label: "JPG, PNG or WebP. Up to 4 MB.",
};

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${Math.round(bytes / (1024 * 1024))} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function validateMediaFile(
  file: File,
  kind: Exclude<PortfolioMediaType, "link"> | "cover",
): string | undefined {
  const rules = kind === "cover" ? COVER_RULES : MEDIA_RULES[kind];
  if (!rules.types.includes(file.type)) return `That file type isn't supported. ${rules.label}`;
  if (file.size > rules.maxBytes) return `That file is too large. Maximum ${formatSize(rules.maxBytes)}.`;
  return undefined;
}

/* ---------- types ---------- */

export type PortfolioCategory = { id: string; slug: string; name: string };

export type PortfolioItem = {
  id: string;
  creator_profile_id: string;
  title: string;
  description: string | null;
  media_type: PortfolioMediaType;
  media_path: string | null;
  thumbnail_path: string | null;
  external_url: string | null;
  category_id: string | null;
  is_featured: boolean;
  visibility: PortfolioVisibility;
  position: number;
  created_at: string;
  updated_at: string;
};

export type PublicPortfolioItem = {
  id: string;
  title: string;
  description: string | null;
  media_type: PortfolioMediaType;
  media_url: string | null;
  thumbnail_url: string | null;
  external_url: string | null;
  is_featured: boolean;
  position: number;
  created_at: string;
  category: { slug: string; name: string } | null;
};

/* ---------- validation ---------- */

export function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function validateTitle(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Give this work a title.";
  if (value.length < PORTFOLIO_LIMITS.title.min) return "That title is too short.";
  if (value.length > PORTFOLIO_LIMITS.title.max)
    return `Keep the title to ${PORTFOLIO_LIMITS.title.max} characters or fewer.`;
  return undefined;
}

export function validateDescription(raw: string): string | undefined {
  if (raw.trim().length > PORTFOLIO_LIMITS.description.max)
    return `Keep the description to ${PORTFOLIO_LIMITS.description.max} characters or fewer.`;
  return undefined;
}

export function validateExternalUrl(raw: string, required: boolean): string | undefined {
  const value = raw.trim();
  if (!value) return required ? "Add the link to this work." : undefined;
  const withScheme = normalizeUrl(value);
  if (withScheme.length > PORTFOLIO_LIMITS.externalUrl.max) return "That link is too long.";
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return "Enter a valid http or https link.";
    if (!url.hostname.includes(".")) return "Enter a valid link.";
  } catch {
    return "Enter a valid link.";
  }
  return undefined;
}

export function hostnameOf(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function portfolioErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("featured_limit_reached"))
    return `You can feature up to ${PORTFOLIO_LIMITS.featured.max} pieces of work at a time. Unfeature one first.`;
  if (raw.includes("portfolio_items_title_len")) return "That title length is out of range.";
  if (raw.includes("portfolio_items_description_len")) return "That description is too long.";
  if (raw.includes("portfolio_items_media_present")) return "Add the media or link for this work.";
  if (raw.includes("row-level security") || raw.includes("permission") || raw.includes("policy"))
    return "You can only change your own portfolio.";
  if (raw.includes("jwt") || raw.includes("session"))
    return "Your session expired. Please log in again.";
  if (raw.includes("payload too large") || raw.includes("exceeded the maximum"))
    return "That file is too large to upload.";
  if (raw.includes("failed to fetch") || raw.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  if (!raw) return "Something went wrong. Please try again.";
  return "We couldn't save this portfolio item. Please try again.";
}
