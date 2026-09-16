import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_LIMITS, validateBookingMessage } from "@/lib/booking";

export function BookingRequestForm({
  serviceTitle,
  saving,
  formError,
  onCancel,
  onSubmit,
}: {
  serviceTitle: string;
  saving: boolean;
  formError: string | null;
  onCancel: () => void;
  onSubmit: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const error = validateBookingMessage(message);
    setValidationError(error);
    if (!error) onSubmit(message.trim());
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-muted-foreground">
        Send a request for <span className="font-medium text-foreground">{serviceTitle}</span>.
      </p>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="booking-message">Message</Label>
        <Textarea
          id="booking-message"
          rows={6}
          maxLength={BOOKING_LIMITS.message.max}
          value={message}
          aria-invalid={Boolean(validationError)}
          placeholder="Share the context, goals, timing, or anything else the creator should know."
          onChange={(event) => setMessage(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {message.trim().length}/{BOOKING_LIMITS.message.max}
        </p>
        {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Sending request…" : "Send request"}
        </Button>
      </div>
    </form>
  );
}
