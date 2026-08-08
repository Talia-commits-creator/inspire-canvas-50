import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthLink } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AUTH_MESSAGES, authErrorMessage, isValidEmail } from "@/lib/auth-utils";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Inspire to Aspire" },
      { name: "description", content: "Request a password reset link for your Inspire to Aspire account." },
      { property: "og:title", content: "Reset your password — Inspire to Aspire" },
      { property: "og:description", content: "Request a password reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    if (!email.trim()) return setFieldError(AUTH_MESSAGES.required);
    if (!isValidEmail(email)) return setFieldError(AUTH_MESSAGES.invalidEmail);
    setFieldError(null);
    setFormError(null);

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);

    if (error && /rate limit|too many/i.test(error.message)) {
      setFormError(authErrorMessage(error.message));
      return;
    }
    // Always confirm generically to avoid revealing whether the account exists.
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        eyebrow="Account"
        title="Check your inbox"
        description={`If an account exists for ${email.trim()}, we've sent a password reset link.`}
        footer={<AuthLink to="/login">Back to log in</AuthLink>}
      >
        <p className="text-sm text-muted-foreground">
          The link expires after a short time. If it doesn't arrive, check your spam folder and
          try again.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to set a new one."
      footer={<AuthLink to="/login">Back to log in</AuthLink>}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            aria-invalid={Boolean(fieldError)}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
