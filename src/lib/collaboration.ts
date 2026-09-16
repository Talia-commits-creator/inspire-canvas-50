export type CollaborationStatus = "draft" | "active" | "completed" | "cancelled";
export type CollaborationParticipantRole = "owner" | "creator" | "client" | "organization";

export type CollaborationParticipant = {
  user_id: string;
  role: CollaborationParticipantRole;
};

export type Collaboration = {
  id: string;
  owner_id: string;
  source_booking_id: string | null;
  organization_id: string | null;
  title: string;
  description: string | null;
  status: CollaborationStatus;
  created_at: string;
  updated_at: string;
  participants: CollaborationParticipant[];
};

export const COLLABORATION_STATUS_LABELS: Record<CollaborationStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const COLLABORATION_ROLE_LABELS: Record<CollaborationParticipantRole, string> = {
  owner: "Owner",
  creator: "Creator",
  client: "Client",
  organization: "Organization",
};

export const COLLABORATION_LIMITS = {
  title: { min: 3, max: 120 },
  description: { max: 2000 },
} as const;

export function validateCollaborationTitle(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Add a title for this collaboration.";
  if (value.length < COLLABORATION_LIMITS.title.min)
    return `Title must be at least ${COLLABORATION_LIMITS.title.min} characters.`;
  if (value.length > COLLABORATION_LIMITS.title.max)
    return `Keep the title to ${COLLABORATION_LIMITS.title.max} characters or fewer.`;
  return undefined;
}

export function collaborationErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("collaboration_requires_accepted_booking")) {
    return "A collaboration can only start from an accepted booking.";
  }
  if (raw.includes("invalid_collaboration_status_transition")) {
    return "This collaboration status cannot be changed that way.";
  }
  if (raw.includes("row-level security") || raw.includes("permission") || raw.includes("policy")) {
    return "You do not have permission to perform that collaboration action.";
  }
  if (raw.includes("jwt") || raw.includes("session")) {
    return "Your session expired. Please log in again.";
  }
  if (raw.includes("failed to fetch") || raw.includes("network")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return "We couldn't save this collaboration. Please try again.";
}
