import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CommunityPostCard } from "@/components/community/community-post-card";
import {
  CommunityPostForm,
  type CommunityPostFormValues,
} from "@/components/community/community-post-form";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SiteLayout } from "@/components/layout/site-layout";
import {
  useDeleteCommunityPost,
  useMyCommunityPosts,
  useSaveCommunityPost,
} from "@/hooks/use-community";
import { communityErrorMessage, type CommunityPost } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/settings/community")({
  head: () => ({
    meta: [
      { title: "My community posts — Inspire to Aspire" },
      { name: "description", content: "Create and manage your Inspire to Aspire community posts." },
    ],
  }),
  component: CommunitySettingsPage,
});

function CommunitySettingsPage() {
  const postsQuery = useMyCommunityPosts();
  const savePost = useSaveCommunityPost();
  const deletePost = useDeleteCommunityPost();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CommunityPost | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CommunityPost | null>(null);
  const posts = postsQuery.data ?? [];

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(post: CommunityPost) {
    setEditing(post);
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSubmit(values: CommunityPostFormValues) {
    try {
      await savePost.mutateAsync({ ...(editing ? { id: editing.id } : {}), ...values });
      setDialogOpen(false);
      setEditing(null);
      toast.success(editing ? "Post updated." : "Post saved.");
    } catch (error) {
      setFormError(communityErrorMessage(error instanceof Error ? error.message : undefined));
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await deletePost.mutateAsync(pendingDelete.id);
      toast.success("Post deleted.");
    } catch (error) {
      toast.error(communityErrorMessage(error instanceof Error ? error.message : undefined));
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Community"
        title="My community posts"
        description="Create updates for the community and control when they are visible."
        actions={<Button onClick={openCreate}>Create post</Button>}
      />
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {postsQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : postsQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load your posts.</span>
              <Button size="sm" variant="outline" onClick={() => void postsQuery.refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Create your first community update when you are ready."
            action={<Button onClick={openCreate}>Create your first post</Button>}
          />
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onEdit={() => openEdit(post)}
                onDelete={() => setPendingDelete(post)}
              />
            ))}
          </ul>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={(open) => !savePost.isPending && setDialogOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit community post" : "Create community post"}</DialogTitle>
            <DialogDescription>Write something useful for the community.</DialogDescription>
          </DialogHeader>
          <CommunityPostForm
            key={editing?.id ?? "new"}
            initialValues={{
              title: editing?.title ?? "",
              body: editing?.body ?? "",
              status: editing?.status ?? "draft",
              visibility: editing?.visibility ?? "public",
            }}
            saving={savePost.isPending}
            formError={formError}
            onCancel={() => setDialogOpen(false)}
            onSubmit={(values) => void handleSubmit(values)}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This community post will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={deletePost.isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteLayout>
  );
}
