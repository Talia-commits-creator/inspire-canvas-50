import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { rolesKey } from "@/hooks/use-profile";
import type {
  CategoryOption,
  CreatorLinks,
  CreatorProfile,
  SkillOption,
} from "@/lib/creator";

const CREATOR_COLUMNS =
  "id, user_id, creator_name, headline, about, primary_category_id, location, availability, experience_level, years_experience, website, links, visibility, created_at, updated_at";

export function creatorProfileKey(userId: string | undefined) {
  return ["creator-profile", userId ?? "anonymous"] as const;
}

export function useCreativeCategories() {
  return useQuery({
    queryKey: ["creative-categories"],
    queryFn: async (): Promise<CategoryOption[]> => {
      const { data, error } = await supabase
        .from("creative_categories")
        .select("id, slug, name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 60_000,
  });
}

export function useCreativeSkills() {
  return useQuery({
    queryKey: ["creative-skills"],
    queryFn: async (): Promise<SkillOption[]> => {
      const { data, error } = await supabase
        .from("creative_skills")
        .select("id, slug, name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 60_000,
  });
}

export type MyCreatorProfile = {
  profile: CreatorProfile;
  categoryIds: string[];
  skillIds: string[];
} | null;

/** The signed-in user's own creator profile, including its category and skill links. */
export function useMyCreatorProfile() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: creatorProfileKey(userId),
    enabled: Boolean(userId) && !loading,
    staleTime: 30_000,
    queryFn: async (): Promise<MyCreatorProfile> => {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select(CREATOR_COLUMNS)
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const profile = {
        ...data,
        links: (data.links ?? {}) as CreatorLinks,
      } as CreatorProfile;

      const [categories, skills] = await Promise.all([
        supabase
          .from("creator_profile_categories")
          .select("category_id")
          .eq("creator_profile_id", profile.id),
        supabase.from("creator_profile_skills").select("skill_id").eq("creator_profile_id", profile.id),
      ]);
      if (categories.error) throw categories.error;
      if (skills.error) throw skills.error;

      return {
        profile,
        categoryIds: (categories.data ?? []).map((row) => row.category_id),
        skillIds: (skills.data ?? []).map((row) => row.skill_id),
      };
    },
  });
}

export type CreatorProfileInput = {
  creator_name: string | null;
  headline: string;
  about: string | null;
  primary_category_id: string | null;
  location: string | null;
  availability: CreatorProfile["availability"];
  experience_level: CreatorProfile["experience_level"];
  years_experience: number | null;
  website: string | null;
  links: CreatorLinks;
  visibility: CreatorProfile["visibility"];
  categoryIds: string[];
  skillIds: string[];
};

async function syncLinks(
  table: "creator_profile_categories" | "creator_profile_skills",
  column: "category_id" | "skill_id",
  creatorProfileId: string,
  ids: string[],
) {
  const { error: deleteError } = await supabase
    .from(table)
    .delete()
    .eq("creator_profile_id", creatorProfileId);
  if (deleteError) throw deleteError;
  if (ids.length === 0) return;
  const rows = ids.map((id) => ({ creator_profile_id: creatorProfileId, [column]: id }));
  const { error } = await supabase.from(table).insert(rows as never);
  if (error) throw error;
}

/** Creates or updates the signed-in user's single creator profile. */
export function useSaveCreatorProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatorProfileInput) => {
      if (!user) throw new Error("session expired");
      const { categoryIds, skillIds, ...values } = input;

      const { data, error } = await supabase
        .from("creator_profiles")
        .upsert({ ...values, user_id: user.id }, { onConflict: "user_id" })
        .select(CREATOR_COLUMNS)
        .single();
      if (error) throw error;

      const profile = { ...data, links: (data.links ?? {}) as CreatorLinks } as CreatorProfile;

      await syncLinks("creator_profile_categories", "category_id", profile.id, categoryIds);
      await syncLinks("creator_profile_skills", "skill_id", profile.id, skillIds);

      // Creator role is self-service; admin remains controlled elsewhere.
      await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role: "creator" })
        .select()
        .maybeSingle();

      return { profile, categoryIds, skillIds } satisfies NonNullable<MyCreatorProfile>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(creatorProfileKey(user?.id), data);
      queryClient.invalidateQueries({ queryKey: rolesKey(user?.id) });
    },
  });
}
