import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
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
import { PortfolioManagerCard } from "@/components/portfolio/portfolio-manager-card";
import {
  PortfolioItemForm,
  emptyPortfolioForm,
  toFormValues,
  type PortfolioFormValues,
  type PortfolioSubmitPayload,
} from "@/components/portfolio/portfolio-item-form";
import { useMyCreatorProfile } from "@/hooks/use-creator";
import {
  removePortfolioFiles,
  uploadPortfolioFile,
  useDeletePortfolioItem,
  useMyPortfolio,
  usePortfolioCategories,
  useSavePortfolioItem,
  useUpdatePortfolioItem,
} from "@/hooks/use-portfolio";
import { useAuth } from "@/hooks/use-auth";
import { PORTFOLIO_LIMITS, portfolioErrorMessage, type PortfolioItem } from "@/lib/portfolio";

export const Route = createFileRoute("/_authenticated/settings/creator_/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Inspire to Aspire" },
      {
        name: "description",
        content: "Add, edit and order the work shown on your public creator profile.",
      },
      { property: "og:title", content: "Portfolio — Inspire to Aspire" },
      { property: "og:description", content: "Showcase the work you've actually made." },
    ],
  }),
  component: PortfolioSettingsPage,
});

function PortfolioSettingsPage() {
  const { user } = useAuth();
  const creatorQuery = useMyCreatorProfile();
  const creatorProfileId = creatorQuery.data?.profile.id;
  const categoriesQuery = usePortfolioCategories();
  const portfolioQuery = useMyPortfolio(creatorProfileId);
  const save = useSavePortfolioItem(creatorProfileId);
  const update = useUpdatePortfolioItem(creatorProfileId);
  const remove = useDeletePortfolioItem(creatorProfileId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [values, setValues] = useState<PortfolioFormValues>(emptyPortfolioForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PortfolioItem | null>(null);

  const items = useMemo(() => portfolioQuery.data ?? [], [portfolioQuery.data]);
  const categories = categoriesQuery.data ?? [];
  const featuredCount = items.filter((item) => item.is_featured).length;
  const atItemLimit = items.length >= PORTFOLIO_LIMITS.items.max;
  const busy = save.isPending || update.isPending || remove.isPending;

  function openCreate() {
    setEditing(null);
    setValues(emptyPortfolioForm);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(item: PortfolioItem) {
    setEditing(item);
    setValues(toFormValues(item));
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSubmit({ values: formValues, mediaFile, coverFile }: PortfolioSubmitPayload) {
    if (!user || !creatorProfileId) return;
    setFormError(null);

    let uploadedMediaPath: string | null = null;
    let uploadedCoverPath: string | null = null;

    try {
      if (mediaFile) {
        setProgressLabel("Uploading media…");
        uploadedMediaPath = await uploadPortfolioFile(user.id, mediaFile, "media");
      }
      if (coverFile) {
        setProgressLabel("Uploading cover…");
        uploadedCoverPath = await uploadPortfolioFile(user.id, coverFile, "cover");
      }
      setProgressLabel("Saving…");

      const isLink = formValues.media_type === "link";
      const mediaPath = isLink ? null : (uploadedMediaPath ?? editing?.media_path ?? null);
      const thumbnailPath = uploadedCoverPath ?? editing?.thumbnail_path ?? null;
      const staleFiles = [
        uploadedMediaPath && editing?.media_path ? editing.media_path : null,
        uploadedCoverPath && editing?.thumbnail_path ? editing.thumbnail_path : null,
      ];

      await save.mutateAsync({
        ...(editing ? { id: editing.id } : {}),
        values: {
          title: formValues.title.trim(),
          description: formValues.description.trim() || null,
          media_type: formValues.media_type,
          media_path: mediaPath,
          thumbnail_path: thumbnailPath,
          external_url: formValues.external_url.trim() || null,
          category_id: formValues.category_id || null,
          is_featured: formValues.is_featured,
          visibility: formValues.visibility,
        },
        nextPosition: items.length,
        staleFiles,
      });

      toast.success(editing ? "Portfolio item updated" : "Added to your portfolio");
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      // The row never saved, so don't leave the freshly uploaded objects behind.
      await removePortfolioFiles([uploadedMediaPath, uploadedCoverPath]);
      setFormError(portfolioErrorMessage((error as Error).message));
    } finally {
      setProgressLabel(null);
    }
  }

  async function handleToggleFeatured(item: PortfolioItem) {
    if (!item.is_featured && featuredCount >= PORTFOLIO_LIMITS.featured.max) {
      toast.error(
        `You can feature up to ${PORTFOLIO_LIMITS.featured.max} pieces. Unfeature one first.`,
      );
      return;
    }
    try {
      await update.mutateAsync({ id: item.id, patch: { is_featured: !item.is_featured } });
    } catch (error) {
      toast.error(portfolioErrorMessage((error as Error).message));
    }
  }

  async function handleToggleVisibility(item: PortfolioItem) {
    try {
      await update.mutateAsync({
        id: item.id,
        patch: { visibility: item.visibility === "public" ? "private" : "public" },
      });
    } catch (error) {
      toast.error(portfolioErrorMessage((error as Error).message));
    }
  }

  /** Manual ordering: swap positions with the neighbour in the current view. */
  async function handleMove(index: number, direction: -1 | 1) {
    const current = items[index];
    const neighbour = items[index + direction];
    if (!current || !neighbour) return;
    try {
      await Promise.all([
        update.mutateAsync({ id: current.id, patch: { position: index + direction } }),
        update.mutateAsync({ id: neighbour.id, patch: { position: index } }),
      ]);
    } catch (error) {
      toast.error(portfolioErrorMessage((error as Error).message));
    }
  }

  async function handleDelete(item: PortfolioItem) {
    try {
      await remove.mutateAsync(item);
      toast.success("Portfolio item deleted");
    } catch (error) {
      toast.error(portfolioErrorMessage((error as Error).message));
    } finally {
      setPendingDelete(null);
    }
  }

  const loading = creatorQuery.isLoading || portfolioQuery.isLoading || categoriesQuery.isLoading;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Creator"
        title="Portfolio"
        description="Show the work you've actually made. Public pieces appear on your creator profile."
        actions={
          creatorProfileId ? (
            <Button onClick={openCreate} disabled={atItemLimit}>
              Add work
            </Button>
          ) : null
        }
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : !creatorProfileId ? (
          <EmptyState
            title="Create your creator profile first"
            description="Your portfolio hangs off your creator profile, so set that up before adding work."
            action={
              <Link to="/settings/creator">
                <Button>Set up creator profile</Button>
              </Link>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No work added yet"
            description="Add images, video, audio or links to work that already lives elsewhere."
            action={<Button onClick={openCreate}>Add your first piece</Button>}
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {items.length} of {PORTFOLIO_LIMITS.items.max} pieces · {featuredCount} of{" "}
              {PORTFOLIO_LIMITS.featured.max} featured
            </p>
            {atItemLimit ? (
              <Alert>
                <AlertDescription>
                  You've reached the {PORTFOLIO_LIMITS.items.max} item limit. Delete something to add more.
                </AlertDescription>
              </Alert>
            ) : null}
            <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <PortfolioManagerCard
                  key={item.id}
                  item={item}
                  categories={categories}
                  busy={busy}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setPendingDelete(item)}
                  onToggleFeatured={() => void handleToggleFeatured(item)}
                  onToggleVisibility={() => void handleToggleVisibility(item)}
                  onMove={(direction) => void handleMove(index, direction)}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!save.isPending) setDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit work" : "Add work"}</DialogTitle>
            <DialogDescription>
              Media is stored privately and shown through short-lived links.
            </DialogDescription>
          </DialogHeader>
          <PortfolioItemForm
            key={editing?.id ?? "new"}
            mode={editing ? "edit" : "create"}
            values={values}
            onChange={setValues}
            categories={categories}
            existing={editing}
            saving={save.isPending || progressLabel !== null}
            progressLabel={progressLabel}
            formError={formError}
            featuredFull={featuredCount >= PORTFOLIO_LIMITS.featured.max && !editing?.is_featured}
            onCancel={() => setDialogOpen(false)}
            onSubmit={(payload) => void handleSubmit(payload)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this work?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” and its uploaded media will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && void handleDelete(pendingDelete)}
              disabled={remove.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SiteLayout>
  );
}
