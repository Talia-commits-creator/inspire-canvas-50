import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CreatorSample } from "@/data/showcase";

const AVAILABILITY_VARIANT = {
  Available: "success",
  Limited: "gold",
  Booked: "muted",
} as const;

export function CreatorCard({
  creator,
  className,
}: {
  creator: CreatorSample;
  className?: string;
}) {
  return (
    <Card className={cn("group flex flex-col overflow-hidden hover:border-foreground/20", className)}>
      <div className="photo-placeholder aspect-[4/3] w-full" role="img" aria-label={`Portrait of ${creator.name}`} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
              {creator.name}
            </h3>
            {creator.verified && (
              <span
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary"
                title="Verified creator"
              >
                <Check className="size-3.5" aria-hidden="true" />
                <span>Verified</span>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {creator.category} · {creator.location}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{creator.description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <Badge variant={AVAILABILITY_VARIANT[creator.availability]}>{creator.availability}</Badge>
          <Button size="sm" variant="outline">
            View profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
