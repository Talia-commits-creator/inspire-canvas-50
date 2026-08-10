import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AVAILABILITY_LABELS, type CreatorAvailability } from "@/lib/creator";

/** Shape any creator surface can produce: real profiles or design samples. */
export type CreatorCardData = {
  username: string;
  name: string;
  headline: string;
  primaryCategory: string | null;
  location: string | null;
  availability: CreatorAvailability;
  avatarUrl?: string | null;
  /** Verification is not implemented yet; only set this when it genuinely is. */
  verified?: boolean;
};

const AVAILABILITY_VARIANT: Record<CreatorAvailability, "success" | "gold" | "muted"> = {
  available: "success",
  limited: "gold",
  unavailable: "muted",
};

export function CreatorCard({
  creator,
  className,
}: {
  creator: CreatorCardData;
  className?: string;
}) {
  return (
    <Card className={cn("group flex flex-col overflow-hidden hover:border-foreground/20", className)}>
      {creator.avatarUrl ? (
        <img
          src={creator.avatarUrl}
          alt={`${creator.name} profile photo`}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div
          className="photo-placeholder aspect-[4/3] w-full"
          role="img"
          aria-label={`Portrait of ${creator.name}`}
        />
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-start gap-x-2">
            <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
              {creator.name}
            </h3>
            {creator.verified ? (
              <Badge variant="secondary" className="mt-0.5">
                Verified
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">@{creator.username}</p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">{creator.headline}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {creator.primaryCategory ? <span>{creator.primaryCategory}</span> : null}
          {creator.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {creator.location}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <Badge variant={AVAILABILITY_VARIANT[creator.availability]}>
            {AVAILABILITY_LABELS[creator.availability]}
          </Badge>
          <Link to="/creators/$username" params={{ username: creator.username }}>
            <Button size="sm" variant="outline">
              View profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
