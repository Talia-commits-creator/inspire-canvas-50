import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { PublicProfile } from "@/lib/profile";

/**
 * Public profile lookup. Reads only the columns the database function exposes
 * (never the authentication email or user id) and signs the avatar so the
 * private storage bucket is not opened up.
 */
export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ username: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data }): Promise<PublicProfile | null> => {
    const url = process.env["SUPABASE_URL"]!;
    const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

    const client = createClient<Database>(url, publishableKey, {
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

    const { data: rows, error } = await client.rpc("get_public_profile", {
      _username: data.username,
    });
    if (error) throw new Error(error.message);

    const profile = (rows as PublicProfile[] | null)?.[0];
    if (!profile) return null;

    let avatarUrl: string | null = null;
    if (profile.avatar_url) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("avatars")
        .createSignedUrl(profile.avatar_url, 60 * 60);
      avatarUrl = signed?.signedUrl ?? null;
    }

    return { ...profile, avatar_url: avatarUrl };
  });
