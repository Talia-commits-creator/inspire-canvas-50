import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProjectSample } from "@/data/showcase";

const STATUS_VARIANT = {
  Open: "success",
  "In progress": "gold",
  Completed: "muted",
} as const;

export function ProjectCard({
  project,
  className,
}: {
  project: ProjectSample;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden hover:border-foreground/20", className)}>
      <div className="photo-placeholder aspect-[3/2] w-full" role="img" aria-label={`${project.title} project image`} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {project.category}
          </p>
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">by {project.owner}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
          <Button size="sm" variant="outline">
            View project
          </Button>
        </div>
      </div>
    </Card>
  );
}
