import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CreatorListItem, PublicCreatorProfile } from "@/lib/creator";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, publishableKey, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.delete("Authorization");
        headers.set("apikey", publishableKey);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signAvatar(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from("avatars").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

/**
 * Public creator profile lookup. The database function only returns rows whose
 * creator profile visibility is `public`, so private profiles are never exposed.
 */
export const getPublicCreatorProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ username: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data }): Promise<PublicCreatorProfile | null> => {
    const { data: row, error } = await publicClient().rpc("get_public_creator_profile", {
      _username: data.username,
    });
    if (error) throw new Error(error.message);
    if (!row) return null;

    const result = row as unknown as PublicCreatorProfile & { avatar_path?: string | null };
    const avatar_url = await signAvatar(result.avatar_path);
    const { avatar_path: _ignored, ...rest } = result;
    return { ...rest, avatar_url } as PublicCreatorProfile;
  });

/** Public creator directory. Foundation only — no search or ranking yet. */
export const listPublicCreators = createServerFn({ method: "GET" }).handler(
  async (): Promise<CreatorListItem[]> => {
    const { data, error } = await publicClient().rpc("list_public_creators", { _limit: 24 });
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as unknown as (CreatorListItem & { avatar_path?: string | null })[];
    return Promise.all(
      rows.map(async ({ avatar_path, ...row }) => ({
        ...row,
        avatar_url: await signAvatar(avatar_path),
      })),
    );
  },
);
