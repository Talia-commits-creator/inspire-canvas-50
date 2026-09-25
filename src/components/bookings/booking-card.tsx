import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Booking, BookingStatus } from "@/lib/booking";
import { BOOKING_STATUS_LABELS } from "@/lib/booking";

const STATUS_VARIANT: Record<BookingStatus, "success" | "gold" | "muted"> = {
  pending: "gold",
  accepted: "success",
  rejected: "muted",
};

export function BookingCard({
  booking,
  mode,
  busy,
  onDecision,
  onStartCollaboration,
}: {
  booking: Booking;
  mode: "requester" | "creator";
  busy?: boolean;
  onDecision?: (status: "accepted" | "rejected") => void;
  onStartCollaboration?: () => void;
}) {
  return (
    <li className="creative-card rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {mode === "creator" ? "Incoming request" : "Your request"}
          </p>
          <h2 className="mt-2 font-display text-lg font-semibold">
            {booking.service?.title ?? "Creator service"}
          </h2>
        </div>
        <Badge variant={STATUS_VARIANT[booking.status]}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {booking.message}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        Requested {new Date(booking.created_at).toLocaleDateString()}
      </p>

      <div
        className="mt-4 flex items-center gap-2"
        aria-label={`Request status: ${BOOKING_STATUS_LABELS[booking.status]}`}
      >
        {(["pending", "accepted"] as const).map((stage, index) => {
          const reached =
            booking.status === "accepted" || (booking.status === "pending" && index === 0);
          return (
            <span
              key={stage}
              className={`h-1.5 flex-1 rounded-full ${reached ? (stage === "accepted" ? "bg-success" : "bg-gold") : "bg-muted"}`}
            />
          );
        })}
        {booking.status === "rejected" ? (
          <span className="text-xs font-medium text-muted-foreground">Request closed</span>
        ) : null}
      </div>

      {booking.status === "accepted" && onStartCollaboration ? (
        <div className="mt-5 border-t border-border pt-4">
          <Button variant="outline" disabled={busy} onClick={onStartCollaboration}>
            Start collaboration
          </Button>
        </div>
      ) : null}

      {mode === "creator" && booking.status === "pending" && onDecision ? (
        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
          <Button disabled={busy} onClick={() => onDecision("accepted")}>
            Accept request
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => onDecision("rejected")}>
            Reject request
          </Button>
        </div>
      ) : null}
    </li>
  );
}
