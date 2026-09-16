export type BookingStatus = "pending" | "accepted" | "rejected";

export type Booking = {
  id: string;
  requester_id: string;
  creator_id: string;
  service_id: string;
  status: BookingStatus;
  message: string;
  created_at: string;
  updated_at: string;
  service?: {
    title: string;
    creator_profile_id: string;
  } | null;
};

export const BOOKING_LIMITS = {
  message: { min: 1, max: 2000 },
} as const;

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function validateBookingMessage(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Add a short message with the context for your request.";
  if (value.length > BOOKING_LIMITS.message.max)
    return `Keep your message to ${BOOKING_LIMITS.message.max} characters or fewer.`;
  return undefined;
}

export function bookingErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("invalid_booking_update")) return "This booking can no longer be changed.";
  if (raw.includes("row-level security") || raw.includes("permission") || raw.includes("policy"))
    return "You do not have permission to perform that booking action.";
  if (raw.includes("jwt") || raw.includes("session"))
    return "Your session expired. Please log in again.";
  if (raw.includes("failed to fetch") || raw.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  if (!raw) return "Something went wrong. Please try again.";
  return "We couldn't save this booking. Please try again.";
}
