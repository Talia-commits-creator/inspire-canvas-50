import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type {
  Service,
  ServicePricingType,
  ServiceVisibility,
} from "@/lib/service";

const SERVICE_COLUMNS =
  "id, creator_profile_id, user_id, title, description, category_id, pricing_type, price, currency, turnaround_days, visibility, position, created_at, updated_at";

export function serviceKey(creatorProfileId: string | undefined) {
  return ["services", creatorProfileId ?? "none"] as const;
}

/** The signed-in creator's own services, including private ones. */
export function useMyServices(creatorProfileId: string | undefined) {
  return useQuery({
    queryKey: serviceKey(creatorProfileId),
    enabled: Boolean(creatorProfileId),
    staleTime: 15_000,
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services")
        .select(SERVICE_COLUMNS)
        .eq("creator_profile_id", creatorProfileId!)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });
}

export type ServiceInput = {
  title: string;
  description: string;
  category_id: string;
  pricing_type: ServicePricingType;
  price: number | null;
  currency: string;
  turnaround_days: number | null;
  visibility: ServiceVisibility;
};

export function useSaveService(creatorProfileId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
      nextPosition,
    }: {
      id?: string;
      values: ServiceInput;
      nextPosition?: number;
    }) => {
      if (!user || !creatorProfileId) throw new Error("session expired");

      if (id) {
        const { data, error } = await supabase
          .from("services")
          .update(values)
          .eq("id", id)
          .select(SERVICE_COLUMNS)
          .single();
        if (error) throw error;
        return data as Service;
      }

      const { data, error } = await supabase
        .from("services")
        .insert({
          ...values,
          creator_profile_id: creatorProfileId,
          user_id: user.id,
          position: nextPosition ?? 0,
        })
        .select(SERVICE_COLUMNS)
        .single();
      if (error) throw error;
      return data as Service;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKey(creatorProfileId) });
    },
  });
}

export function useUpdateService(creatorProfileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Service, "visibility" | "position">>;
    }) => {
      const { error } = await supabase.from("services").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKey(creatorProfileId) });
    },
  });
}

export function useDeleteService(creatorProfileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase.from("services").delete().eq("id", serviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: serviceKey(creatorProfileId) });
    },
  });
}
