import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  emptyTitle = "Coming soon",
  emptyDescription = "This section is part of the architecture foundation. The feature will be built out in an upcoming phase.",
  icon = Construction,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  icon?: LucideIcon;
}) {
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
      </div>
    </SiteLayout>
  );
}
