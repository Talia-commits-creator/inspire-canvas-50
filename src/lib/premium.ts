/**
 * Premium plans, subscription lifecycle, and entitlement domain rules.
 *
 * Provides a provider-agnostic foundation for feature gating, plan representation,
 * and account/organization entitlement checks.
 */

export type SubscriptionStatus =
  "active" | "trialing" | "past_due" | "cancelled" | "expired" | "inactive";

export type PlanBillingInterval = "monthly" | "yearly" | "one_time";

export type PlanTargetEntity = "user" | "organization";

export type SubscriptionPlan = {
  id: string;
  slug: string;
  name: string;
  description: string;
  target_entity: PlanTargetEntity;
  price_minor: number;
  currency: string;
  billing_interval: PlanBillingInterval;
  is_active: boolean;
  sort_order: number;
  features: string[];
};

export type PlanEntitlement = {
  feature_key: string;
  value_numeric: number | null;
};

export type UserSubscription = {
  id: string | null;
  status: SubscriptionStatus;
  provider: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  plan: {
    id: string;
    slug: string;
    name: string;
    target_entity: PlanTargetEntity;
    price_minor: number;
    currency: string;
    billing_interval: PlanBillingInterval;
  };
};

export const PREMIUM_FEATURES = {
  PORTFOLIO_MAX_ITEMS: "portfolio.max_items",
  SERVICES_MAX_ITEMS: "services.max_items",
  CREATOR_VERIFIED_BADGE: "creator.verified_badge",
  CREATOR_FEATURED_PORTFOLIO: "creator.featured_portfolio",
  CREATOR_ANALYTICS: "creator.analytics",
  CREATOR_PRIORITY_DISCOVERY: "creator.priority_discovery",
  COMMUNITY_POST: "community.post",
  ORG_VERIFIED_BADGE: "org.verified_badge",
  ORG_PRIORITY_DIRECTORY: "org.priority_directory",
  ORG_COLLABORATION_UNLIMITED: "org.collaboration_unlimited",
  ORG_PARTNER_SPOTLIGHT: "org.partner_spotlight",
} as const;

export type PremiumFeatureKey = (typeof PREMIUM_FEATURES)[keyof typeof PREMIUM_FEATURES];

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past Due",
  cancelled: "Cancelled",
  expired: "Expired",
  inactive: "Inactive",
};

export const BILLING_INTERVAL_LABELS: Record<PlanBillingInterval, string> = {
  monthly: "/month",
  yearly: "/year",
  one_time: "one-time",
};

export const DEFAULT_FREE_LIMITS = {
  portfolioItems: 6,
  services: 3,
} as const;

export const DEFAULT_PRO_LIMITS = {
  portfolioItems: 60,
  services: 50,
} as const;

export function isSubscriptionActive(status: SubscriptionStatus | undefined | null): boolean {
  return status === "active" || status === "trialing";
}

export function formatPlanPrice(
  priceMinor: number,
  currency: string,
  interval: PlanBillingInterval,
): string {
  if (priceMinor === 0) {
    return "Free";
  }

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: priceMinor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(priceMinor / 100);

  const suffix = BILLING_INTERVAL_LABELS[interval] ?? "";
  return `${formatted}${suffix}`;
}

export function premiumErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("provider") && raw.includes("config")) {
    return "Billing provider integration is not yet configured.";
  }
  if (raw.includes("jwt") || raw.includes("session")) {
    return "Your session expired. Please log in again.";
  }
  if (raw.includes("failed to fetch") || raw.includes("network")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return "We couldn't complete the subscription request. Please try again.";
}
