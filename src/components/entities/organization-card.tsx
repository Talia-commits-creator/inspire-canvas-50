import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OrganizationListItem } from "@/lib/organization";
import type { OrganizationSample } from "@/data/showcase";

export function OrganizationCard({
  organization,
  className,
}: {
  organization: OrganizationListItem | OrganizationSample;
  className?: string;
}) {
  const isPublicRecord = "slug" in organization;
  const initials = isPublicRecord
    ? organization.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "ORG"
    : organization.initials;
  const type = isPublicRecord ? organization.organization_type : organization.type;
  const description = isPublicRecord
    ? organization.short_description || "This organization has not added a summary yet."
    : organization.description;
  const logoUrl = isPublicRecord ? organization.logo_url : null;
  return (
    <Card className={cn("creative-card group flex flex-col overflow-hidden", className)}>
      <div className="relative flex h-36 items-end overflow-hidden bg-[radial-gradient(ellipse_at_82%_20%,color-mix(in_oklab,var(--color-gold)_55%,transparent),transparent_30%),linear-gradient(135deg,var(--surface-warm),var(--surface-teal))] p-5">
        <span className="grid size-14 place-items-center overflow-hidden rounded-2xl border border-background/70 bg-background/85 font-display text-lg font-semibold text-primary shadow-sm">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${organization.name} logo`}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <Badge variant="gold" className="ml-auto">
          {type}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div>
          <h3 className="font-display text-xl font-semibold leading-snug tracking-tight">
            {organization.name}
          </h3>
          {organization.location ? (
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              {organization.location}
            </p>
          ) : null}
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {isPublicRecord ? (
          <Link
            to="/organizations/$slug"
            params={{ slug: organization.slug }}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline"
          >
            Explore organization <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        ) : (
          <Button size="sm" variant="outline" className="self-start" disabled>
            Preview
          </Button>
        )}
      </div>
    </Card>
  );
}
