/**
 * Creator service domain rules.
 *
 * Portfolio answers: "What have you created?"
 * Services answer: "What can you offer to someone?"
 *
 * Services are simple, professional, and ready for future marketplace/booking
 * functionality without implementing bookings, payments, or transactions now.
 */

export type ServicePricingType = "fixed" | "starting_from" | "contact";
export type ServiceVisibility = "public" | "private";

export const SERVICE_LIMITS = {
  title: { min: 3, max: 100 },
  description: { min: 1, max: 1200 },
  turnaroundDays: { min: 1, max: 365 },
  items: { max: 50 },
} as const;

export const PRICING_TYPE_OPTIONS: {
  value: ServicePricingType;
  label: string;
  hint: string;
}[] = [
  {
    value: "fixed",
    label: "Fixed price",
    hint: "A clear, set price for this service deliverable.",
  },
  {
    value: "starting_from",
    label: "Starting from",
    hint: "A baseline rate that adjusts with scope or deliverables.",
  },
  {
    value: "contact",
    label: "Contact for pricing",
    hint: "Custom quotes tailored to specific client needs.",
  },
];

export const PRICING_TYPE_LABELS: Record<ServicePricingType, string> = {
  fixed: "Fixed price",
  starting_from: "Starting from",
  contact: "Contact for pricing",
};

export const SERVICE_VISIBILITY_OPTIONS: {
  value: ServiceVisibility;
  label: string;
  hint: string;
}[] = [
  { value: "public", label: "Public", hint: "Shown on your public creator profile." },
  { value: "private", label: "Private", hint: "Only you can see it in your settings." },
];

export const CURRENCY_OPTIONS = [
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

/* ---------- types ---------- */

export type ServiceCategory = { id: string; slug: string; name: string };

export type Service = {
  id: string;
  creator_profile_id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: string;
  pricing_type: ServicePricingType;
  price: number | null;
  currency: string;
  turnaround_days: number | null;
  visibility: ServiceVisibility;
  position: number;
  created_at: string;
  updated_at: string;
};

export type PublicServiceItem = {
  id: string;
  title: string;
  description: string;
  pricing_type: ServicePricingType;
  price: number | null;
  currency: string;
  turnaround_days: number | null;
  position: number;
  created_at: string;
  category: { id: string; slug: string; name: string } | null;
};

/* ---------- validation ---------- */

export function validateServiceTitle(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Give this service a title.";
  if (value.length < SERVICE_LIMITS.title.min)
    return `Title must be at least ${SERVICE_LIMITS.title.min} characters.`;
  if (value.length > SERVICE_LIMITS.title.max)
    return `Keep the title to ${SERVICE_LIMITS.title.max} characters or fewer.`;
  return undefined;
}

export function validateServiceDescription(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Describe what this service includes.";
  if (value.length > SERVICE_LIMITS.description.max)
    return `Keep the description to ${SERVICE_LIMITS.description.max} characters or fewer.`;
  return undefined;
}

export function validateServiceCategory(categoryId: string): string | undefined {
  if (!categoryId || !categoryId.trim()) return "Select a creative category for this service.";
  return undefined;
}

export function validateServicePrice(
  pricingType: ServicePricingType,
  rawPrice: string | number | null | undefined,
): string | undefined {
  if (pricingType === "contact") {
    if (rawPrice !== null && rawPrice !== undefined && String(rawPrice).trim() !== "") {
      return "Contact pricing cannot have a set price.";
    }
    return undefined;
  }

  const str = String(rawPrice ?? "").trim();
  if (!str) return "Enter a price for this service.";
  const num = Number(str);
  if (Number.isNaN(num) || num < 0) return "Price must be a valid number greater than or equal to 0.";
  return undefined;
}

export function validateServiceCurrency(currency: string): string | undefined {
  const val = currency.trim().toUpperCase();
  if (!val || val.length !== 3 || !/^[A-Z]{3}$/.test(val))
    return "Enter a valid 3-letter currency code (e.g. EUR).";
  return undefined;
}

export function validateServiceTurnaround(
  raw: string | number | null | undefined,
): string | undefined {
  const str = String(raw ?? "").trim();
  if (!str) return undefined; // Turnaround is optional
  const num = Number(str);
  if (
    !/^\d+$/.test(str) ||
    Number.isNaN(num) ||
    num < SERVICE_LIMITS.turnaroundDays.min ||
    num > SERVICE_LIMITS.turnaroundDays.max
  ) {
    return `Turnaround must be a whole number between ${SERVICE_LIMITS.turnaroundDays.min} and ${SERVICE_LIMITS.turnaroundDays.max} days.`;
  }
  return undefined;
}

/* ---------- formatters ---------- */

export function formatServicePrice(
  pricingType: ServicePricingType,
  price: number | null,
  currency = "EUR",
): string {
  if (pricingType === "contact" || price === null || price === undefined) {
    return "Contact for pricing";
  }

  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
  const formattedNum =
    price % 1 === 0
      ? price.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const priceStr = symbol.length === 1 ? `${symbol}${formattedNum}` : `${formattedNum} ${currency.toUpperCase()}`;

  if (pricingType === "starting_from") {
    return `From ${priceStr}`;
  }
  return priceStr;
}

export function formatTurnaround(days: number | null | undefined): string | null {
  if (!days || days <= 0) return null;
  return days === 1 ? "1 day turnaround" : `${days} days turnaround`;
}

/* ---------- error message mapper ---------- */

export function serviceErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("services_title_len"))
    return `The title must be between ${SERVICE_LIMITS.title.min} and ${SERVICE_LIMITS.title.max} characters.`;
  if (raw.includes("services_description_len"))
    return `The description must be ${SERVICE_LIMITS.description.max} characters or fewer.`;
  if (raw.includes("services_price_rules"))
    return "Fixed and starting-from pricing require a non-negative price. Contact pricing must have no price.";
  if (raw.includes("services_currency_format")) return "Currency must be a 3-character uppercase code.";
  if (raw.includes("services_turnaround_range"))
    return `Turnaround time must be between ${SERVICE_LIMITS.turnaroundDays.min} and ${SERVICE_LIMITS.turnaroundDays.max} days.`;
  if (raw.includes("row-level security") || raw.includes("permission") || raw.includes("policy"))
    return "You can only manage your own services.";
  if (raw.includes("jwt") || raw.includes("session"))
    return "Your session expired. Please log in again.";
  if (raw.includes("failed to fetch") || raw.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  if (!raw) return "Something went wrong. Please try again.";
  return "We couldn't save this service. Please try again.";
}
