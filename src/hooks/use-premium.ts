import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  type SubscriptionPlan,
  type UserSubscription,
  type PremiumFeatureKey,
  PREMIUM_FEATURES,
  DEFAULT_FREE_LIMITS,
  DEFAULT_PRO_LIMITS,
  isSubscriptionActive,
} from "@/lib/premium";

type PremiumRpcClient = {
  rpc: (
    name: "get_my_active_subscription" | "has_user_entitlement" | "has_organization_entitlement",
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: unknown,
      ) => {
        order: (
          column: string,
          opts?: { ascending?: boolean },
        ) => PromiseLike<{
          data: unknown;
          error: { message?: string } | null;
        }>;
      };
      order: (
        column: string,
        opts?: { ascending?: boolean },
      ) => PromiseLike<{
        data: unknown;
        error: { message?: string } | null;
      }>;
    };
  };
};

function premiumClient() {
  return supabase as unknown as PremiumRpcClient;
}

export const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "plan_free",
    slug: "free",
    name: "Free Community",
    description: "Essential tools for emerging creators and individual community members.",
    target_entity: "user",
    price_minor: 0,
    currency: "EUR",
    billing_interval: "monthly",
    is_active: true,
    sort_order: 0,
    features: [
      "Public Creator & Universal Profile",
      "Portfolio showcase up to 6 works",
      "List up to 3 services",
      "Direct client booking requests",
      "Community discussions & feed",
    ],
  },
  {
    id: "plan_creator_pro",
    slug: "creator_pro",
    name: "Creator Pro",
    description:
      "Enhanced visibility, expanded portfolio capacity, and verified presence for working professionals.",
    target_entity: "user",
    price_minor: 1200,
    currency: "EUR",
    billing_interval: "monthly",
    is_active: true,
    sort_order: 1,
    features: [
      "Everything in Free Community",
      "Verified Creator badge on profile & cards",
      "Expanded portfolio capacity up to 60 works",
      "List up to 50 active services",
      "Priority placement in Creator discovery",
      "Performance metrics & analytics foundation",
    ],
  },
  {
    id: "plan_organization_pro",
    slug: "organization_pro",
    name: "Organization Partner",
    description:
      "Elevate your cultural institution, studio, or nonprofit with partner branding and collaboration tools.",
    target_entity: "organization",
    price_minor: 4900,
    currency: "EUR",
    billing_interval: "monthly",
    is_active: true,
    sort_order: 2,
    features: [
      "Dedicated Organization profile & unique slug",
      "Verified Organization badge",
      "Featured showcase in Organization directory",
      "Multi-creator collaboration workspace",
      "Priority partner community spotlight",
      "Direct creator outreach & booking pipeline",
    ],
  },
];

export const FALLBACK_USER_SUBSCRIPTION: UserSubscription = {
  id: null,
  status: "active",
  provider: "default",
  current_period_start: null,
  current_period_end: null,
  cancel_at_period_end: false,
  plan: {
    id: "plan_free",
    slug: "free",
    name: "Free Community",
    target_entity: "user",
    price_minor: 0,
    currency: "EUR",
    billing_interval: "monthly",
  },
};

export function subscriptionPlansKey() {
  return ["subscription_plans", "list"] as const;
}

export function mySubscriptionKey(userId: string | undefined) {
  return ["subscriptions", "me", userId ?? "anonymous"] as const;
}

export function userEntitlementKey(userId: string | undefined, featureKey: string) {
  return ["entitlements", "user", userId ?? "anonymous", featureKey] as const;
}

export function organizationSubscriptionKey(orgId: string | undefined) {
  return ["subscriptions", "organization", orgId ?? "none"] as const;
}

/**
 * Fetch catalog of available subscription plans.
 * Falls back to static plan catalog if database is not yet migrated.
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: subscriptionPlansKey(),
    staleTime: 60_000,
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      try {
        const { data, error } = await premiumClient()
          .from("subscription_plans")
          .select(
            "id, slug, name, description, target_entity, price_minor, currency, billing_interval, is_active, sort_order, features",
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error || !data || !Array.isArray(data) || data.length === 0) {
          return FALLBACK_PLANS;
        }

        return (data as Array<Record<string, unknown>>).map((row) => ({
          id: String(row.id),
          slug: String(row.slug),
          name: String(row.name),
          description: String(row.description),
          target_entity: row.target_entity as "user" | "organization",
          price_minor: Number(row.price_minor ?? 0),
          currency: String(row.currency ?? "EUR"),
          billing_interval:
            (row.billing_interval as "monthly" | "yearly" | "one_time") ?? "monthly",
          is_active: Boolean(row.is_active),
          sort_order: Number(row.sort_order ?? 0),
          features: Array.isArray(row.features) ? (row.features as string[]) : [],
        }));
      } catch {
        return FALLBACK_PLANS;
      }
    },
  });
}

/**
 * Fetch current user's active subscription tier.
 */
export function useMySubscription() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: mySubscriptionKey(userId),
    enabled: Boolean(userId) && !loading,
    staleTime: 30_000,
    queryFn: async (): Promise<UserSubscription> => {
      try {
        const { data, error } = await premiumClient().rpc("get_my_active_subscription");
        if (error || !data) {
          return FALLBACK_USER_SUBSCRIPTION;
        }
        return data as UserSubscription;
      } catch {
        return FALLBACK_USER_SUBSCRIPTION;
      }
    },
  });
}

/**
 * Authoritative check for a specific feature entitlement.
 */
export function useEntitlement(featureKey: PremiumFeatureKey | string) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const { data: subscription, isLoading: subLoading } = useMySubscription();

  const isPro =
    isSubscriptionActive(subscription?.status) && subscription?.plan.slug === "creator_pro";

  const entitlementQuery = useQuery({
    queryKey: userEntitlementKey(userId, featureKey),
    enabled: Boolean(userId) && !authLoading,
    staleTime: 30_000,
    queryFn: async (): Promise<boolean> => {
      try {
        const { data, error } = await premiumClient().rpc("has_user_entitlement", {
          _feature_key: featureKey,
          _user_id: userId,
        });
        if (error) {
          // Fallback based on subscription plan if RPC fails
          if (isPro) return true;
          return (
            featureKey === PREMIUM_FEATURES.COMMUNITY_POST ||
            featureKey === PREMIUM_FEATURES.PORTFOLIO_MAX_ITEMS ||
            featureKey === PREMIUM_FEATURES.SERVICES_MAX_ITEMS
          );
        }
        return Boolean(data);
      } catch {
        if (isPro) return true;
        return (
          featureKey === PREMIUM_FEATURES.COMMUNITY_POST ||
          featureKey === PREMIUM_FEATURES.PORTFOLIO_MAX_ITEMS ||
          featureKey === PREMIUM_FEATURES.SERVICES_MAX_ITEMS
        );
      }
    },
  });

  const numericLimit = (() => {
    if (featureKey === PREMIUM_FEATURES.PORTFOLIO_MAX_ITEMS) {
      return isPro ? DEFAULT_PRO_LIMITS.portfolioItems : DEFAULT_FREE_LIMITS.portfolioItems;
    }
    if (featureKey === PREMIUM_FEATURES.SERVICES_MAX_ITEMS) {
      return isPro ? DEFAULT_PRO_LIMITS.services : DEFAULT_FREE_LIMITS.services;
    }
    return undefined;
  })();

  const hasEntitlement =
    isPro || (entitlementQuery.data ?? featureKey === PREMIUM_FEATURES.COMMUNITY_POST);

  return {
    hasEntitlement,
    limit: numericLimit,
    isLoading: authLoading || subLoading || entitlementQuery.isLoading,
    isPro,
    subscription,
  };
}
