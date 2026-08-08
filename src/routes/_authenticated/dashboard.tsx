import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Inspire to Aspire" },
      { name: "description", content: "Your personal workspace on Inspire to Aspire." },
      { property: "og:title", content: "Dashboard — Inspire to Aspire" },
      { property: "og:description", content: "Your personal workspace on the platform." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("You have been signed out.");
      navigate({ to: "/login", replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="Your personal workspace. Profile and platform modules arrive in the next phase."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Account</CardTitle>
            <CardDescription>You are signed in to Inspire to Aspire.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium break-all">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Log out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}
