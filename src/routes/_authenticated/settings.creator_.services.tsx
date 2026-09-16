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
import { ServiceManagerCard } from "@/components/services/service-manager-card";
import {
  ServiceForm,
  emptyServiceForm,
  toServiceFormValues,
  type ServiceFormValues,
} from "@/components/services/service-form";
import { useCreativeCategories, useMyCreatorProfile } from "@/hooks/use-creator";
import {
  useDeleteService,
  useMyServices,
  useSaveService,
  useUpdateService,
} from "@/hooks/use-services";
import { useAuth } from "@/hooks/use-auth";
import { useMySubscription } from "@/hooks/use-premium";
import { UpgradePrompt } from "@/components/premium/upgrade-prompt";
import { SERVICE_LIMITS, serviceErrorMessage, type Service } from "@/lib/service";

export const Route = createFileRoute("/_authenticated/settings/creator_/services")({
  head: () => ({
    meta: [
      { title: "Services — Inspire to Aspire" },
      {
        name: "description",
        content: "Add, edit and order the creative services shown on your public creator profile.",
      },
      { property: "og:title", content: "Services — Inspire to Aspire" },
      {
        property: "og:description",
        content: "Showcase the creative services you can offer to clients and collaborators.",
      },
    ],
  }),
  component: ServicesSettingsPage,
});

function ServicesSettingsPage() {
  const { user } = useAuth();
  const creatorQuery = useMyCreatorProfile();
  const creatorProfileId = creatorQuery.data?.profile.id;
  const categoriesQuery = useCreativeCategories();
  const servicesQuery = useMyServices(creatorProfileId);
  const mySubQuery = useMySubscription();
  const save = useSaveService(creatorProfileId);
  const update = useUpdateService(creatorProfileId);
  const remove = useDeleteService(creatorProfileId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [values, setValues] = useState<ServiceFormValues>(emptyServiceForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);

  const isPro = mySubQuery.data?.plan.slug === "creator_pro";
  const items = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const categories = categoriesQuery.data ?? [];
  const atItemLimit = items.length >= SERVICE_LIMITS.items.max;
  const busy = save.isPending || update.isPending || remove.isPending;

  function openCreate() {
    setEditing(null);
    setValues(emptyServiceForm);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setEditing(service);
    setValues(toServiceFormValues(service));
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSubmit(formValues: ServiceFormValues) {
    if (!user || !creatorProfileId) return;
    setFormError(null);

    const isContact = formValues.pricing_type === "contact";
    const price = isContact || !formValues.price.trim() ? null : Number(formValues.price);
    const turnaround = formValues.turnaround_days.trim()
      ? Number(formValues.turnaround_days)
      : null;

    try {
      await save.mutateAsync({
        ...(editing ? { id: editing.id } : {}),
        values: {
          title: formValues.title.trim(),
          description: formValues.description.trim(),
          category_id: formValues.category_id,
          pricing_type: formValues.pricing_type,
          price,
          currency: formValues.currency.trim().toUpperCase(),
          turnaround_days: turnaround,
          visibility: formValues.visibility,
        },
        nextPosition: items.length,
      });

      toast.success(editing ? "Service updated" : "Service created");
      setDialogOpen(false);
      setEditing(null);
    } catch (error) {
      setFormError(serviceErrorMessage((error as Error).message));
    }
  }

  async function handleToggleVisibility(service: Service) {
    try {
      await update.mutateAsync({
        id: service.id,
        patch: { visibility: service.visibility === "public" ? "private" : "public" },
      });
    } catch (error) {
      toast.error(serviceErrorMessage((error as Error).message));
    }
  }

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
      toast.error(serviceErrorMessage((error as Error).message));
    }
  }

  async function handleDelete(service: Service) {
    try {
      await remove.mutateAsync(service.id);
      toast.success("Service deleted");
    } catch (error) {
      toast.error(serviceErrorMessage((error as Error).message));
    } finally {
      setPendingDelete(null);
    }
  }

  const loading = creatorQuery.isLoading || servicesQuery.isLoading || categoriesQuery.isLoading;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Creator"
        title="Services"
        description="Define what you offer to clients and collaborators. Public services appear on your creator profile."
        actions={
          creatorProfileId ? (
            <Button onClick={openCreate} disabled={atItemLimit}>
              Add service
            </Button>
          ) : null
        }
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : !creatorProfileId ? (
          <EmptyState
            title="Create your creator profile first"
            description="Your services hang off your creator profile, so set that up before offering services."
            action={
              <Link to="/settings/creator">
                <Button>Set up creator profile</Button>
              </Link>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No services added yet"
            description="Define packages, day rates, or starting prices so people know how they can hire or collaborate with you."
            action={<Button onClick={openCreate}>Add your first service</Button>}
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {items.length} of {isPro ? 50 : SERVICE_LIMITS.items.max} services
              </p>
            </div>
            {!isPro ? (
              <UpgradePrompt
                compact
                feature="Creator Pro unlocks up to 50 services, priority placement, and verified badge."
              />
            ) : null}
            {atItemLimit ? (
              <Alert>
                <AlertDescription>
                  You've reached the {SERVICE_LIMITS.items.max} service limit. Delete a service to
                  add more.
                </AlertDescription>
              </Alert>
            ) : null}
            <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <ServiceManagerCard
                  key={item.id}
                  item={item}
                  categories={categories}
                  busy={busy}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  onEdit={() => openEdit(item)}
                  onDelete={() => setPendingDelete(item)}
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
            <DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle>
            <DialogDescription>
              Provide clear details about what you offer, pricing, and expected turnaround time.
            </DialogDescription>
          </DialogHeader>
          <ServiceForm
            key={editing?.id ?? "new"}
            mode={editing ? "edit" : "create"}
            values={values}
            onChange={setValues}
            categories={categories}
            saving={save.isPending}
            formError={formError}
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
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” will be permanently removed from your profile.
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
