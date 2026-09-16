import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { CommunityPost, PublicCommunityPost } from "@/lib/community";

const POST_COLUMNS = "id, author_id, title, body, status, visibility, created_at, updated_at";

type CommunityResult = { data: unknown; error: { message?: string } | null };
type CommunityQuery = PromiseLike<CommunityResult> & {
  select: (columns: string) => CommunityQuery;
  insert: (values: Record<string, unknown>) => CommunityQuery;
  update: (values: Record<string, unknown>) => CommunityQuery;
  delete: () => CommunityQuery;
  eq: (column: string, value: string) => CommunityQuery;
  order: (column: string, options: { ascending: boolean }) => CommunityQuery;
  single: () => PromiseLike<CommunityResult>;
};
type CommunityClient = {
  from: (table: "community_posts") => CommunityQuery;
  rpc: (name: "list_community_posts", args: { _limit: number }) => PromiseLike<CommunityResult>;
};

function communityClient() {
  return supabase as unknown as CommunityClient;
}

export function communityFeedKey() {
  return ["community", "feed"] as const;
}

export function communityPostsKey(userId: string | undefined) {
  return ["community", "posts", userId ?? "anonymous"] as const;
}

export function useCommunityFeed() {
  return useQuery({
    queryKey: communityFeedKey(),
    staleTime: 15_000,
    queryFn: async (): Promise<PublicCommunityPost[]> => {
      const { data, error } = await communityClient().rpc("list_community_posts", { _limit: 30 });
      if (error) throw error;
      return (data ?? []) as PublicCommunityPost[];
    },
  });
}

export function useMyCommunityPosts() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: communityPostsKey(userId),
    enabled: Boolean(userId) && !loading,
    staleTime: 15_000,
    queryFn: async (): Promise<CommunityPost[]> => {
      const { data, error } = await communityClient()
        .from("community_posts")
        .select(POST_COLUMNS)
        .eq("author_id", userId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CommunityPost[];
    },
  });
}

export function useSaveCommunityPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      body,
      status,
      visibility,
    }: {
      id?: string;
      title: string;
      body: string;
      status: CommunityPost["status"];
      visibility: CommunityPost["visibility"];
    }) => {
      if (!user) throw new Error("session expired");
      const query = id
        ? communityClient()
            .from("community_posts")
            .update({ title, body, status, visibility })
            .eq("id", id)
            .eq("author_id", user.id)
        : communityClient()
            .from("community_posts")
            .insert({ author_id: user.id, title, body, status, visibility });
      const { data, error } = await query.select(POST_COLUMNS).single();
      if (error) throw error;
      return data as CommunityPost;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityPostsKey(user?.id) });
      void queryClient.invalidateQueries({ queryKey: communityFeedKey() });
    },
  });
}

export function useDeleteCommunityPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("session expired");
      const { error } = await communityClient()
        .from("community_posts")
        .delete()
        .eq("id", postId)
        .eq("author_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityPostsKey(user?.id) });
      void queryClient.invalidateQueries({ queryKey: communityFeedKey() });
    },
  });
}
