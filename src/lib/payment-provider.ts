import type { PaymentStatus } from "@/lib/payment";

export type CreatePaymentCheckoutInput = {
  paymentId: string;
  amountMinor: number;
  currency: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
};

export type PaymentCheckoutSession = {
  provider: string;
  providerPaymentId: string;
  checkoutUrl: string;
};

export type PaymentProvider = {
  readonly name: string;
  createCheckoutSession(input: CreatePaymentCheckoutInput): Promise<PaymentCheckoutSession>;
  getPaymentStatus(providerPaymentId: string): Promise<PaymentStatus>;
};

export class PaymentProviderNotConfiguredError extends Error {
  constructor() {
    super("payment provider not configured");
    this.name = "PaymentProviderNotConfiguredError";
  }
}

/** Provider implementations belong on the server and must never expose secrets to the browser. */
export function getPaymentProvider(): PaymentProvider | null {
  return null;
}
