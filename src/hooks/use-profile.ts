import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Profile } from "@/lib/profile";
import { AVATAR_MAX_BYTES, AVATAR_TYPES } from "@/lib/profile";

const PROFILE_COLUMNS = "id, display_name, username, avatar_url, bio, location, website, created_at, updated_at";

export function profileKey(userId: string | undefined) {
  return ["profile", userId ?? "anonymous"] as const;
}

export function rolesKey(userId: string | undefined) {
  return ["roles", userId ?? "anonymous"] as const;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export function useProfile() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: profileKey(userId),
    queryFn: () => fetchProfile(userId!),
    enabled: Boolean(userId) && !loading,
    staleTime: 30_000,
  });
}

export function useRoles() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: rolesKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((row) => row.role as string);
    },
    enabled: Boolean(userId) && !loading,
    staleTime: 60_000,
  });
}

/** Avatars live in a private bucket; render them through short-lived signed URLs. */
export function useAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar-url", path ?? "none"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("avatars").createSignedUrl(path!, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: Boolean(path),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

export type ProfileUpdate = {
  display_name: string | null;
  username: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url?: string | null;
};

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProfileUpdate) => {
      if (!user) throw new Error("session expired");
      const { data, error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id)
        .select(PROFILE_COLUMNS)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey(user?.id), data);
    },
  });
}

export function validateAvatarFile(file: File): string | undefined {
  if (!(AVATAR_TYPES as readonly string[]).includes(file.type))
    return "Please choose a JPG, PNG or WebP image.";
  if (file.size > AVATAR_MAX_BYTES) return "Images must be 2 MB or smaller.";
  return undefined;
}

export function useUploadAvatar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("session expired");
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", user.id)
        .select(PROFILE_COLUMNS)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey(user?.id), data);
      queryClient.invalidateQueries({ queryKey: ["avatar-url"] });
    },
  });
}
