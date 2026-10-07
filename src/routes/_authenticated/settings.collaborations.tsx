import { createFileRoute, Link } from "@tanstack/react-router";
import { CollaborationCard } from "@/components/collaborations/collaboration-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout } from "@/components/layout/site-layout";
import { useAuth } from "@/hooks/use-auth";
import { useMyCollaborations } from "@/hooks/use-collaborations";

export const Route = createFileRoute("/_authenticated/settings/collaborations")({
  head: () => ({
    meta: [
      { title: "Collaborations — DAREY CREATIVES" },
      { name: "description", content: "Track your active collaborations on DAREY CREATIVES." },
    ],
  }),
  component: CollaborationsPage,
});

function CollaborationsPage() {
  const { loading: authLoading } = useAuth();
  const collaborationsQuery = useMyCollaborations();
  const collaborations = collaborationsQuery.data ?? [];

  const isLoading =
    authLoading ||
    collaborationsQuery.isLoading ||
    (collaborationsQuery.isPending && !collaborationsQuery.isError);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Workspace"
        title="Collaborations"
        description="Shared workspaces created from accepted service requests."
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : collaborationsQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load your collaborations.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void collaborationsQuery.refetch()}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : collaborations.length === 0 ? (
          <EmptyState
            title="No collaborations yet"
            description="Collaborations begin when a creator accepts a booking request. Browse creators to find someone to work with."
            action={
              <Link to="/creators">
                <Button>Browse creators</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-4">
            {collaborations.map((collaboration) => (
              <CollaborationCard key={collaboration.id} collaboration={collaboration} />
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
