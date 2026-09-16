import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommunityPost, PublicCommunityPost } from "@/lib/community";
import { COMMUNITY_STATUS_LABELS, COMMUNITY_VISIBILITY_LABELS } from "@/lib/community";

export function PublicCommunityPostCard({ post }: { post: PublicCommunityPost }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            @{post.author_username}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">{post.title}</h2>
        </div>
        <time className="text-xs text-muted-foreground" dateTime={post.created_at}>
          {new Date(post.created_at).toLocaleDateString()}
        </time>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {post.body}
      </p>
      {post.author_display_name ? (
        <p className="mt-4 text-xs text-muted-foreground">{post.author_display_name}</p>
      ) : null}
    </article>
  );
}

export function CommunityPostCard({
  post,
  onEdit,
  onDelete,
}: {
  post: CommunityPost;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">{post.title}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{COMMUNITY_STATUS_LABELS[post.status]}</Badge>
            <Badge variant="outline">{COMMUNITY_VISIBILITY_LABELS[post.visibility]}</Badge>
          </div>
        </div>
        <time className="text-xs text-muted-foreground" dateTime={post.updated_at}>
          Updated {new Date(post.updated_at).toLocaleDateString()}
        </time>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {post.body}
      </p>
      <div className="mt-5 flex gap-2 border-t border-border pt-4">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </li>
  );
}
