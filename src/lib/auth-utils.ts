export const AUTH_MESSAGES = {
  invalidEmail: "Enter a valid email address.",
  required: "This field is required.",
  weakPassword: "Password must be at least 8 characters.",
  mismatch: "Passwords do not match.",
} as const;

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Maps provider errors to friendly copy without leaking account existence. */
export function authErrorMessage(message: string | undefined): string {
  const raw = (message ?? "").toLowerCase();

  if (raw.includes("invalid login credentials")) {
    return "That email and password combination doesn't match an account.";
  }
  if (raw.includes("email not confirmed")) {
    return "Please confirm your email address before signing in. Check your inbox for the verification link.";
  }
  if (raw.includes("user already registered") || raw.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (raw.includes("password should be at least")) {
    return AUTH_MESSAGES.weakPassword;
  }
  if (raw.includes("rate limit") || raw.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (raw.includes("expired") || raw.includes("invalid") || raw.includes("token")) {
    return "This link is invalid or has expired. Request a new password reset email.";
  }
  if (!raw) return "Something went wrong. Please try again.";
  return "We couldn't complete that request. Please try again.";
}

/** Only allow same-origin relative paths as post-login destinations. */
export function safeRedirect(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
