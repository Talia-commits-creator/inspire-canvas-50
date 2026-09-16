/**
 * Provider-agnostic billing provider interface.
 *
 * Designed so that real billing providers (Stripe, LemonSqueezy, etc.) can be
 * connected later on the server without changing the frontend or schema contracts.
 */

export type CreateSubscriptionCheckoutInput = {
  planSlug: string;
  targetEntity: "user" | "organization";
  organizationId?: string;
  successUrl: string;
  cancelUrl: string;
};

export type BillingCheckoutSession = {
  provider: string;
  providerSessionId: string;
  checkoutUrl: string;
};

export type BillingCustomerPortalSession = {
  provider: string;
  portalUrl: string;
};

export type BillingProvider = {
  readonly name: string;
  createCheckoutSession(input: CreateSubscriptionCheckoutInput): Promise<BillingCheckoutSession>;
  createCustomerPortalSession(input: { returnUrl: string }): Promise<BillingCustomerPortalSession>;
};

export class BillingProviderNotConfiguredError extends Error {
  constructor() {
    super("Billing provider is not configured.");
    this.name = "BillingProviderNotConfiguredError";
  }
}

/**
 * Provider implementations belong on the server and must never expose secrets to the browser.
 * Returns null when billing integration is not yet connected.
 */
export function getBillingProvider(): BillingProvider | null {
  return null;
}
