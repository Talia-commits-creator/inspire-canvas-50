import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  emptyTitle = "In development",
  emptyDescription = "This section is part of the platform foundation. It will be built out in an upcoming phase.",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    </SiteLayout>
  );
}
