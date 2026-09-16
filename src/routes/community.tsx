import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CommunityPostForm,
  type CommunityPostFormValues,
} from "@/components/community/community-post-form";
import { PublicCommunityPostCard } from "@/components/community/community-post-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout } from "@/components/layout/site-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCommunityFeed, useSaveCommunityPost } from "@/hooks/use-community";
import { communityErrorMessage } from "@/lib/community";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Inspire to Aspire" },
      {
        name: "description",
        content: "Join conversations, groups, and events across the community.",
      },
      { property: "og:title", content: "Community — Inspire to Aspire" },
      {
        property: "og:description",
        content: "Groups, discussions, and events for creators and audiences.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { user } = useAuth();
  const feedQuery = useCommunityFeed();
  const savePost = useSaveCommunityPost();
  const posts = feedQuery.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(values: CommunityPostFormValues) {
    try {
      await savePost.mutateAsync(values);
      setDialogOpen(false);
      toast.success("Community post published.");
    } catch (error) {
      setFormError(communityErrorMessage(error instanceof Error ? error.message : undefined));
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Community"
        title="Where the ecosystem gathers"
        description="Updates, ideas, opportunities, and creative work shared by the Inspire to Aspire community."
        actions={
          user ? (
            <Button
              onClick={() => {
                setFormError(null);
                setDialogOpen(true);
              }}
            >
              Share an update
            </Button>
          ) : (
            <Link to="/login" search={{ redirect: "/community" }}>
              <Button variant="outline">Log in to share</Button>
            </Link>
          )
        }
      />
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {feedQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : feedQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load the community feed.</span>
              <Button size="sm" variant="outline" onClick={() => void feedQuery.refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : posts.length === 0 ? (
          <EmptyState
            title="The community is just getting started"
            description="Be the first to share an update."
          />
        ) : (
          posts.map((post) => <PublicCommunityPostCard key={post.id} post={post} />)
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={(open) => !savePost.isPending && setDialogOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Share with the community</DialogTitle>
            <DialogDescription>
              Publish an update, idea, opportunity, or piece of work.
            </DialogDescription>
          </DialogHeader>
          <CommunityPostForm
            initialValues={{ title: "", body: "", status: "published", visibility: "public" }}
            saving={savePost.isPending}
            formError={formError}
            onCancel={() => setDialogOpen(false)}
            onSubmit={(values) => void handleSubmit(values)}
          />
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
