import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Organization, OrganizationLinks, OrganizationVisibility } from "@/lib/organization";

const ORGANIZATION_COLUMNS =
  "id, owner_id, name, slug, logo_path, short_description, description, organization_type, location, website, links, visibility, created_at, updated_at";

export function organizationKey(userId: string | undefined) {
  return ["organization", userId ?? "anonymous"] as const;
}

export function useOrganizationLogoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["organization-logo-url", path ?? "none"],
    queryFn: async () => {
      if (!path) return null;
      const { data, error } = await supabase.storage.from("organization_logos").createSignedUrl(path, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: Boolean(path),
    staleTime: 30 * 60_000,
    retry: 1,
  });
}

export function useMyOrganization() {
  const { user, loading } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: organizationKey(userId),
    queryFn: async (): Promise<Organization | null> => {
      const { data, error } = await supabase
        .from("organizations")
        .select(ORGANIZATION_COLUMNS)
        .eq("owner_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as Organization | null) ?? null;
    },
    enabled: Boolean(userId) && !loading,
    staleTime: 30_000,
  });
}

export type OrganizationInput = {
  name: string;
  slug: string;
  logo_path?: string | null;
  short_description: string;
  description: string | null;
  organization_type: string;
  location: string | null;
  website: string | null;
  links: OrganizationLinks;
  visibility: OrganizationVisibility;
};

export function useSaveOrganization() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OrganizationInput) => {
      if (!user) throw new Error("session expired");
      const { data, error } = await supabase
        .from("organizations")
        .upsert({ ...input, owner_id: user.id }, { onConflict: "owner_id" })
        .select(ORGANIZATION_COLUMNS)
        .single();
      if (error) throw error;
      return data as Organization;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKey(user?.id), data);
    },
  });
}

export function useUploadOrganizationLogo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("session expired");

      const { data: existing, error: fetchError } = await supabase
        .from("organizations")
        .select(ORGANIZATION_COLUMNS)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!existing) throw new Error("Create your organization before uploading a logo.");

      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/logo-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("organization_logos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("organizations")
        .update({ logo_path: path })
        .eq("owner_id", user.id)
        .select(ORGANIZATION_COLUMNS)
        .single();
      if (error) throw error;
      return data as Organization;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(organizationKey(user?.id), data);
      queryClient.invalidateQueries({ queryKey: ["organization-logo-url"] });
    },
  });
}

export function validateOrganizationLogoFile(file: File): string | undefined {
  const allowed = ["image/jpeg", "image/png", "image/webp"] as const;
  if (!(allowed as readonly string[]).includes(file.type))
    return "Please choose a JPG, PNG or WebP image.";
  if (file.size > 2 * 1024 * 1024) return "Images must be 2 MB or smaller.";
  return undefined;
}
