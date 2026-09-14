import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { PublicServiceItem } from "@/lib/service";

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
 * Public services for a creator. The database function only returns public
 * services belonging to public creator profiles.
 */
export const getPublicServices = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ username: z.string().min(1).max(40) }).parse(data))
  .handler(async ({ data }): Promise<PublicServiceItem[]> => {
    const { data: rows, error } = await publicClient().rpc("get_public_services", {
      _username: data.username,
    });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as PublicServiceItem[];
  });
