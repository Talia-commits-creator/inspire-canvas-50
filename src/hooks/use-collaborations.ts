import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Collaboration } from "@/lib/collaboration";

const COLLABORATION_COLUMNS =
  "id, owner_id, source_booking_id, organization_id, title, description, status, created_at, updated_at, participants:collaboration_participants(user_id, role)";

type CollaborationResult = { data: unknown; error: { message?: string } | null };
type CollaborationQuery = PromiseLike<CollaborationResult> & {
  select: (columns: string) => CollaborationQuery;
  eq: (column: string, value: string) => CollaborationQuery;
  order: (column: string, options: { ascending: boolean }) => CollaborationQuery;
};
type CollaborationClient = {
  from: (table: "collaborations") => CollaborationQuery;
  rpc: (
    name: "create_collaboration_from_booking",
    args: { _booking_id: string; _title: string; _description: string | null },
  ) => PromiseLike<CollaborationResult>;
};

function collaborationClient() {
  return supabase as unknown as CollaborationClient;
}

export function collaborationsKey(userId: string | undefined) {
  return ["collaborations", userId ?? "anonymous"] as const;
}

export function useMyCollaborations() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: collaborationsKey(userId),
    enabled: Boolean(userId) && !loading,
    staleTime: 15_000,
    queryFn: async (): Promise<Collaboration[]> => {
      const { data, error } = await collaborationClient()
        .from("collaborations")
        .select(COLLABORATION_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Collaboration[];
    },
  });
}

export function useCreateCollaborationFromBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      title,
      description,
    }: {
      bookingId: string;
      title: string;
      description?: string | null;
    }) => {
      if (!user) throw new Error("session expired");
      const { data, error } = await collaborationClient().rpc("create_collaboration_from_booking", {
        _booking_id: bookingId,
        _title: title,
        _description: description ?? null,
      });
      if (error) throw error;
      return data as Collaboration;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collaborationsKey(user?.id) });
    },
  });
}
