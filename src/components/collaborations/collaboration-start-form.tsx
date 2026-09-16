import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COLLABORATION_LIMITS, validateCollaborationTitle } from "@/lib/collaboration";

export function CollaborationStartForm({
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
  onSubmit: (values: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState(`Collaboration: ${serviceTitle}`);
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const error = validateCollaborationTitle(title);
    setTitleError(error);
    if (!error) onSubmit({ title: title.trim(), description: description.trim() });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-muted-foreground">
        Start a shared workspace from the accepted service request. Participants can see its status
        and details.
      </p>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="collaboration-title">Title</Label>
        <Input
          id="collaboration-title"
          maxLength={COLLABORATION_LIMITS.title.max}
          value={title}
          aria-invalid={Boolean(titleError)}
          onChange={(event) => setTitle(event.target.value)}
        />
        {titleError ? <p className="text-sm text-destructive">{titleError}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="collaboration-description">Description</Label>
        <Textarea
          id="collaboration-description"
          rows={5}
          maxLength={COLLABORATION_LIMITS.description.max}
          value={description}
          placeholder="Add the shared goal, deliverables, or context for this collaboration."
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Starting…" : "Start collaboration"}
        </Button>
      </div>
    </form>
  );
}
