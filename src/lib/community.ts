export type CommunityPostStatus = "draft" | "published" | "archived";
export type CommunityPostVisibility = "public" | "private";

export type CommunityPost = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  status: CommunityPostStatus;
  visibility: CommunityPostVisibility;
  created_at: string;
  updated_at: string;
};

export type PublicCommunityPost = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  author_username: string;
  author_display_name: string | null;
};

export const COMMUNITY_POST_LIMITS = {
  title: { min: 3, max: 120 },
  body: { min: 1, max: 5000 },
} as const;

export const COMMUNITY_STATUS_LABELS: Record<CommunityPostStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const COMMUNITY_VISIBILITY_LABELS: Record<CommunityPostVisibility, string> = {
  public: "Public",
  private: "Private",
};

export function validateCommunityPostTitle(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Add a title for your post.";
  if (value.length < COMMUNITY_POST_LIMITS.title.min)
    return `Title must be at least ${COMMUNITY_POST_LIMITS.title.min} characters.`;
  if (value.length > COMMUNITY_POST_LIMITS.title.max)
    return `Keep the title to ${COMMUNITY_POST_LIMITS.title.max} characters or fewer.`;
  return undefined;
}

export function validateCommunityPostBody(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Add some content to your post.";
  if (value.length > COMMUNITY_POST_LIMITS.body.max)
    return `Keep the post to ${COMMUNITY_POST_LIMITS.body.max} characters or fewer.`;
  return undefined;
}

export function communityErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();
  if (raw.includes("community_post_author_is_immutable")) {
    return "Post ownership cannot be changed.";
  }
  if (raw.includes("invalid_community_post_status_transition")) {
    return "This post status cannot be changed that way.";
  }
  if (raw.includes("row-level security") || raw.includes("permission") || raw.includes("policy")) {
    return "You can only manage your own community posts.";
  }
  if (raw.includes("jwt") || raw.includes("session")) {
    return "Your session expired. Please log in again.";
  }
  if (raw.includes("failed to fetch") || raw.includes("network")) {
    return "We couldn't reach the server. Check your connection and try again.";
  }
  return "We couldn't save this community post. Please try again.";
}
