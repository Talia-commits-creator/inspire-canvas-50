export type AdminOverview = {
  public_creators: number;
  public_organizations: number;
  public_services: number;
  published_community_posts: number;
  pending_bookings: number;
  active_collaborations: number;
};

export function adminErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (
    raw.includes("admin_access_required") ||
    raw.includes("permission") ||
    raw.includes("forbidden")
  ) {
    return "You do not have administrator access.";
  }
  if (raw.includes("jwt") || raw.includes("session")) {
    return "Your session expired. Please log in again.";
  }
  if (raw.includes("failed to fetch") || raw.includes("network")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return "We couldn't load the admin overview. Please try again.";
}
