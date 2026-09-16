import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Booking, BookingStatus } from "@/lib/booking";

const BOOKING_COLUMNS =
  "id, requester_id, creator_id, service_id, status, message, created_at, updated_at, service:services(title, creator_profile_id)";

type BookingTable = PromiseLike<BookingResult> & {
  select: (columns: string) => BookingTable;
  insert: (values: Record<string, unknown>) => BookingTable;
  update: (values: Record<string, unknown>) => BookingTable;
  eq: (column: string, value: string) => BookingTable;
  order: (column: string, options: { ascending: boolean }) => BookingTable;
  single: () => PromiseLike<BookingResult>;
};

type BookingRpcClient = {
  rpc: (
    name: "create_booking",
    args: { _service_id: string; _message: string },
  ) => PromiseLike<BookingResult>;
};

type BookingResult = {
  data: unknown;
  error: { message?: string } | null;
};

function bookingsTable() {
  return (supabase as unknown as { from: (table: "bookings") => BookingTable }).from("bookings");
}

function bookingRpc() {
  return supabase as unknown as BookingRpcClient;
}

export function requesterBookingsKey(userId: string | undefined) {
  return ["bookings", "requester", userId ?? "anonymous"] as const;
}

export function creatorBookingsKey(userId: string | undefined) {
  return ["bookings", "creator", userId ?? "anonymous"] as const;
}

export function useMyBookings() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: requesterBookingsKey(userId),
    enabled: Boolean(userId) && !loading,
    staleTime: 15_000,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await bookingsTable()
        .select(BOOKING_COLUMNS)
        .eq("requester_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });
}

export function useCreatorBookings() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: creatorBookingsKey(userId),
    enabled: Boolean(userId) && !loading,
    staleTime: 15_000,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await bookingsTable()
        .select(BOOKING_COLUMNS)
        .eq("creator_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });
}

export function useCreateBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, message }: { serviceId: string; message: string }) => {
      if (!user) throw new Error("session expired");
      const { data, error } = await bookingRpc().rpc("create_booking", {
        _service_id: serviceId,
        _message: message,
      });
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: requesterBookingsKey(user?.id) });
    },
  });
}

export function useUpdateBookingStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Extract<BookingStatus, "accepted" | "rejected">;
    }) => {
      if (!user) throw new Error("session expired");
      const { data, error } = await bookingsTable()
        .update({ status })
        .eq("id", id)
        .eq("creator_id", user.id)
        .select(BOOKING_COLUMNS)
        .single();
      if (error) throw error;
      return data as Booking;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: creatorBookingsKey(user?.id) });
      void queryClient.invalidateQueries({ queryKey: ["bookings", "requester"] });
    },
  });
}
