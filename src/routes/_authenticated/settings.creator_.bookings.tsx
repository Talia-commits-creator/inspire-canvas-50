import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { BookingCard } from "@/components/bookings/booking-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteLayout } from "@/components/layout/site-layout";
import { useCreatorBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { bookingErrorMessage } from "@/lib/booking";

export const Route = createFileRoute("/_authenticated/settings/creator_/bookings")({
  head: () => ({
    meta: [
      { title: "Booking requests — Inspire to Aspire" },
      { name: "description", content: "Review booking requests for your creator services." },
    ],
  }),
  component: CreatorBookingsPage,
});

function CreatorBookingsPage() {
  const bookingsQuery = useCreatorBookings();
  const updateStatus = useUpdateBookingStatus();
  const bookings = bookingsQuery.data ?? [];

  async function handleDecision(id: string, status: "accepted" | "rejected") {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(
        status === "accepted" ? "Booking request accepted." : "Booking request rejected.",
      );
    } catch (error) {
      toast.error(bookingErrorMessage(error instanceof Error ? error.message : undefined));
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Creator"
        title="Booking requests"
        description="Review requests for your public services and decide which ones to accept."
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {bookingsQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : bookingsQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>We couldn't load your booking requests.</span>
              <Button size="sm" variant="outline" onClick={() => void bookingsQuery.refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No booking requests yet"
            description="Requests for your public creator services will appear here."
          />
        ) : (
          <ul className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                mode="creator"
                busy={updateStatus.isPending}
                onDecision={(status) => void handleDecision(booking.id, status)}
              />
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
