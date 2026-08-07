import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OrganizationSample } from "@/data/showcase";

export function OrganizationCard({
  organization,
  className,
}: {
  organization: OrganizationSample;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden hover:border-foreground/20", className)}>
      <div className="photo-placeholder aspect-[16/7] w-full" role="img" aria-label={`${organization.name} cover image`} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-secondary font-display text-sm font-semibold text-foreground"
          >
            {organization.initials}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
              {organization.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {organization.type} · {organization.location}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{organization.description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <Badge variant="outline">{organization.type}</Badge>
          <Button size="sm" variant="outline">
            View organization
          </Button>
        </div>
      </div>
    </Card>
  );
}
