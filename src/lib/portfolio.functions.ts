import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { PublicPortfolioItem } from "@/lib/portfolio";

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

/**
 * Public portfolio for a creator. Media lives in a private bucket, so paths are
 * exchanged for short-lived signed URLs on the server. The database function
 * only returns public items belonging to public creator profiles.
 */
export const getPublicPortfolio = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ username: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data }): Promise<PublicPortfolioItem[]> => {
    const { data: rows, error } = await publicClient().rpc("get_public_portfolio", {
      _username: data.username,
    });
    if (error) throw new Error(error.message);

    const items = (rows ?? []) as unknown as (Omit<PublicPortfolioItem, "media_url" | "thumbnail_url"> & {
      media_path: string | null;
      thumbnail_path: string | null;
    })[];
    if (items.length === 0) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const paths = Array.from(
      new Set(items.flatMap((item) => [item.media_path, item.thumbnail_path].filter(Boolean) as string[])),
    );
    const signed = new Map<string, string>();
    if (paths.length > 0) {
      const { data: urls } = await supabaseAdmin.storage
        .from("portfolio")
        .createSignedUrls(paths, 60 * 60);
      for (const entry of urls ?? []) {
        if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
      }
    }

    return items.map(({ media_path, thumbnail_path, ...item }) => ({
      ...item,
      media_url: media_path ? (signed.get(media_path) ?? null) : null,
      thumbnail_url: thumbnail_path ? (signed.get(thumbnail_path) ?? null) : null,
    }));
  });
