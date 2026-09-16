import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { AdminOverview } from "@/lib/admin";

type AdminRpcClient = {
  rpc: (
    name: "get_admin_overview",
    args?: Record<string, never>,
  ) => PromiseLike<{ data: unknown; error: { message?: string } | null }>;
};

function adminClient() {
  return supabase as unknown as AdminRpcClient;
}

export function adminOverviewKey(userId: string | undefined) {
  return ["admin", "overview", userId ?? "anonymous"] as const;
}

export function useAdminOverview() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: adminOverviewKey(userId),
    enabled: Boolean(userId) && !loading,
    staleTime: 30_000,
    queryFn: async (): Promise<AdminOverview> => {
      const { data, error } = await adminClient().rpc("get_admin_overview");
      if (error) throw error;
      return data as AdminOverview;
    },
  });
}
