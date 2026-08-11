import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type {
  PortfolioCategory,
  PortfolioItem,
  PortfolioMediaType,
  PortfolioVisibility,
} from "@/lib/portfolio";

const ITEM_COLUMNS =
  "id, creator_profile_id, title, description, media_type, media_path, thumbnail_path, external_url, category_id, is_featured, visibility, position, created_at, updated_at";

export function portfolioKey(creatorProfileId: string | undefined) {
  return ["portfolio", creatorProfileId ?? "none"] as const;
}

export function usePortfolioCategories() {
  return useQuery({
    queryKey: ["portfolio-categories"],
    queryFn: async (): Promise<PortfolioCategory[]> => {
      const { data, error } = await supabase
        .from("portfolio_categories")
        .select("id, slug, name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 60_000,
  });
}

/** The signed-in creator's own items, including private ones. */
export function useMyPortfolio(creatorProfileId: string | undefined) {
  return useQuery({
    queryKey: portfolioKey(creatorProfileId),
    enabled: Boolean(creatorProfileId),
    staleTime: 15_000,
    queryFn: async (): Promise<PortfolioItem[]> => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select(ITEM_COLUMNS)
        .eq("creator_profile_id", creatorProfileId!)
        .order("is_featured", { ascending: false })
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PortfolioItem[];
    },
  });
}

/** Private bucket: render owned media through short-lived signed URLs. */
export function usePortfolioMediaUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["portfolio-media-url", path ?? "none"],
    enabled: Boolean(path),
    staleTime: 30 * 60_000,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("portfolio").createSignedUrl(path!, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && /^[a-zA-Z0-9]{1,5}$/.test(fromName)) return fromName.toLowerCase();
  return (file.type.split("/").pop() ?? "bin").toLowerCase();
}

/** Uploads into the creator's own folder — storage policies enforce ownership. */
export async function uploadPortfolioFile(userId: string, file: File, kind: "media" | "cover") {
  const path = `${userId}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function removePortfolioFiles(paths: (string | null | undefined)[]) {
  const list = paths.filter(Boolean) as string[];
  if (list.length === 0) return;
  await supabase.storage.from("portfolio").remove(list);
}

export type PortfolioItemInput = {
  title: string;
  description: string | null;
  media_type: PortfolioMediaType;
  media_path: string | null;
  thumbnail_path: string | null;
  external_url: string | null;
  category_id: string | null;
  is_featured: boolean;
  visibility: PortfolioVisibility;
};

export function useSavePortfolioItem(creatorProfileId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
      nextPosition,
      staleFiles,
    }: {
      id?: string;
      values: PortfolioItemInput;
      nextPosition?: number;
      staleFiles?: (string | null | undefined)[];
    }) => {
      if (!user || !creatorProfileId) throw new Error("session expired");

      if (id) {
        const { data, error } = await supabase
          .from("portfolio_items")
          .update(values)
          .eq("id", id)
          .select(ITEM_COLUMNS)
          .single();
        if (error) throw error;
        await removePortfolioFiles(staleFiles ?? []);
        return data as PortfolioItem;
      }

      const { data, error } = await supabase
        .from("portfolio_items")
        .insert({
          ...values,
          creator_profile_id: creatorProfileId,
          user_id: user.id,
          position: nextPosition ?? 0,
        })
        .select(ITEM_COLUMNS)
        .single();
      if (error) throw error;
      return data as PortfolioItem;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portfolioKey(creatorProfileId) });
    },
  });
}

export function useUpdatePortfolioItem(creatorProfileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<PortfolioItem, "is_featured" | "visibility" | "position">>;
    }) => {
      const { error } = await supabase.from("portfolio_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portfolioKey(creatorProfileId) });
    },
  });
}

export function useDeletePortfolioItem(creatorProfileId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: PortfolioItem) => {
      // Remove the row first: if storage cleanup fails the item is already gone
      // from every surface, and orphaned objects stay inside the owner's folder.
      const { error } = await supabase.from("portfolio_items").delete().eq("id", item.id);
      if (error) throw error;
      await removePortfolioFiles([item.media_path, item.thumbnail_path]);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: portfolioKey(creatorProfileId) });
    },
  });
}
