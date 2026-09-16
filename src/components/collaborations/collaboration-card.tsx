import { Badge } from "@/components/ui/badge";
import type { Collaboration, CollaborationStatus } from "@/lib/collaboration";
import { COLLABORATION_ROLE_LABELS, COLLABORATION_STATUS_LABELS } from "@/lib/collaboration";

const STATUS_VARIANT: Record<CollaborationStatus, "success" | "gold" | "muted"> = {
  draft: "muted",
  active: "success",
  completed: "gold",
  cancelled: "muted",
};

export function CollaborationCard({ collaboration }: { collaboration: Collaboration }) {
  return (
    <li className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Collaboration
          </p>
          <h2 className="mt-2 font-display text-lg font-semibold">{collaboration.title}</h2>
        </div>
        <Badge variant={STATUS_VARIANT[collaboration.status]}>
          {COLLABORATION_STATUS_LABELS[collaboration.status]}
        </Badge>
      </div>

      {collaboration.description ? (
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {collaboration.description}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        {collaboration.participants.map((participant) => (
          <Badge key={`${participant.user_id}-${participant.role}`} variant="secondary">
            {COLLABORATION_ROLE_LABELS[participant.role]}
          </Badge>
        ))}
      </div>
    </li>
  );
}
