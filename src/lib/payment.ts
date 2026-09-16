export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled";

export type PaymentTransaction = {
  id: string;
  booking_id: string;
  payer_id: string;
  payee_id: string;
  provider: string;
  provider_payment_id: string | null;
  amount_minor: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  succeeded: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function formatPaymentAmount(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountMinor / 100);
}

export function validatePaymentAmount(amountMinor: number): string | undefined {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    return "Payment amounts must be non-negative whole minor units.";
  }
  return undefined;
}

export function validatePaymentCurrency(currency: string): string | undefined {
  if (!/^[A-Z]{3}$/.test(currency.trim().toUpperCase())) {
    return "Payment currency must be a 3-letter ISO code.";
  }
  return undefined;
}

export function paymentErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("invalid_payment_booking")) {
    return "Payments can only be created for accepted bookings.";
  }
  if (raw.includes("provider") && raw.includes("config")) {
    return "Payments are not configured yet.";
  }
  if (raw.includes("jwt") || raw.includes("session")) {
    return "Your session expired. Please log in again.";
  }
  if (raw.includes("failed to fetch") || raw.includes("network")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return "We couldn't complete this payment action. Please try again.";
}
