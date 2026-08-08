import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthLink } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { AUTH_MESSAGES, authErrorMessage, isValidEmail } from "@/lib/auth-utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Inspire to Aspire" },
      { name: "description", content: "Create your Inspire to Aspire account with email and password." },
      { property: "og:title", content: "Create account — Inspire to Aspire" },
      { property: "og:description", content: "Join Inspire to Aspire." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && session && !checkEmail) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, checkEmail, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = AUTH_MESSAGES.required;
    else if (!isValidEmail(email)) nextErrors.email = AUTH_MESSAGES.invalidEmail;
    if (!password) nextErrors.password = AUTH_MESSAGES.required;
    else if (password.length < 8) nextErrors.password = AUTH_MESSAGES.weakPassword;
    if (confirm !== password) nextErrors.confirm = AUTH_MESSAGES.mismatch;
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setSubmitting(false);

    if (error) {
      setFormError(authErrorMessage(error.message));
      return;
    }

    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <AuthShell
        eyebrow="Account"
        title="Confirm your email"
        description={`We've sent a verification link to ${email.trim()}. Confirm your address to activate your account, then log in.`}
        footer={
          <>
            Already confirmed? <AuthLink to="/login">Log in</AuthLink>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          If the email doesn't arrive within a few minutes, check your spam folder or try
          registering again with the same address.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account"
      title="Create your account"
      description="Start with your email and a password. Profile details come later."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Log in</AuthLink>
        </>
      }
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
            aria-invalid={Boolean(errors.email)}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirm">Confirm password</Label>
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
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
