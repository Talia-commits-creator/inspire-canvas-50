import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { SiteLayout } from "@/components/layout/site-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOverview } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { adminErrorMessage } from "@/lib/admin";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin — Inspire to Aspire" },
      { name: "description", content: "Administrative overview for Inspire to Aspire." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const OVERVIEW_CARDS = [
  ["public_creators", "Public creators"],
  ["public_organizations", "Public organizations"],
  ["public_services", "Public services"],
  ["published_community_posts", "Published posts"],
  ["pending_bookings", "Pending bookings"],
  ["active_collaborations", "Active collaborations"],
] as const;

function AdminPage() {
  const { user } = useAuth();
  const overviewQuery = useAdminOverview();
  const overview = overviewQuery.data;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Administration"
        title="Platform overview"
        description="A high-level view of public platform activity and workflow status."
        actions={
          <Badge variant="secondary">
            <ShieldCheck className="mr-1.5 size-3.5" aria-hidden />
            Admin access
          </Badge>
        }
      />
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {overviewQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OVERVIEW_CARDS.map(([key]) => (
              <Skeleton key={key} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : overviewQuery.isError ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {adminErrorMessage((overviewQuery.error as { message?: string })?.message)}
              </span>
              <Button size="sm" variant="outline" onClick={() => void overviewQuery.refetch()}>
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OVERVIEW_CARDS.map(([key, label]) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-display text-3xl font-semibold">{overview?.[key] ?? 0}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Admin scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This foundation is read-only. It exposes aggregate counts without private user
                  records or service-role credentials.
                </p>
                <Link to="/dashboard">
                  <Button variant="outline">Return to dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
        {user ? (
          <p className="text-xs text-muted-foreground">Signed in as an administrator.</p>
        ) : null}
      </div>
    </SiteLayout>
  );
}
