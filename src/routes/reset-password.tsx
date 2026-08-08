import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthLink } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AUTH_MESSAGES, authErrorMessage } from "@/lib/auth-utils";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password — Inspire to Aspire" },
      { name: "description", content: "Choose a new password for your Inspire to Aspire account." },
      { property: "og:title", content: "Set a new password — Inspire to Aspire" },
      { property: "og:description", content: "Choose a new password for your account." },
    ],
  }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus((current) => (current === "ready" ? current : data.session ? "ready" : "invalid"));
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: typeof errors = {};
    if (!password) nextErrors.password = AUTH_MESSAGES.required;
    else if (password.length < 8) nextErrors.password = AUTH_MESSAGES.weakPassword;
    if (confirm !== password) nextErrors.confirm = AUTH_MESSAGES.mismatch;
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormError(authErrorMessage(error.message));
      return;
    }

    toast.success("Your password has been updated.");
    navigate({ to: "/dashboard", replace: true });
  }

  if (status === "checking") {
    return (
      <AuthShell title="Checking your link" description="One moment while we verify your reset link.">
        <div className="h-2 w-full animate-pulse rounded-md bg-secondary" />
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell
        eyebrow="Account"
        title="Link expired"
        description="This password reset link is invalid or has expired."
        footer={<AuthLink to="/forgot-password">Request a new link</AuthLink>}
      >
        <p className="text-sm text-muted-foreground">
          Reset links can only be used once and expire after a short period.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Set a new password"
      description="Choose a new password to finish signing back in."
      footer={<AuthLink to="/login">Back to log in</AuthLink>}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            aria-invalid={Boolean(errors.password)}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          {errors.password ? <p className="text-sm text-destructive">{errors.password}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            aria-invalid={Boolean(errors.confirm)}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {errors.confirm ? <p className="text-sm text-destructive">{errors.confirm}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Updating password…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
