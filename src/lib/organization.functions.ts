import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { OrganizationListItem, PublicOrganization } from "@/lib/organization";

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

async function signLogo(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage.from("organization_logos").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export const getPublicOrganization = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }): Promise<PublicOrganization | null> => {
    const { data: row, error } = await publicClient().rpc("get_public_organization", {
      _slug: data.slug,
    });
    if (error) throw new Error(error.message);
    if (!row) return null;

    const org = row as unknown as PublicOrganization & { logo_path?: string | null };
    const logo_url = await signLogo(org.logo_path ?? null);
    const { logo_path: _ignored, ...rest } = org;
    return { ...rest, logo_url } as PublicOrganization;
  });

export const listPublicOrganizations = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrganizationListItem[]> => {
    const { data, error } = await publicClient().rpc("list_public_organizations", { _limit: 24 });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as (OrganizationListItem & { logo_path?: string | null })[];
    return Promise.all(
      rows.map(async ({ logo_path, ...row }) => ({
        ...row,
        logo_url: await signLogo(logo_path),
      })),
    );
  },
);
