import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMMUNITY_POST_LIMITS,
  COMMUNITY_STATUS_LABELS,
  COMMUNITY_VISIBILITY_LABELS,
  validateCommunityPostBody,
  validateCommunityPostTitle,
  type CommunityPostStatus,
  type CommunityPostVisibility,
} from "@/lib/community";

export type CommunityPostFormValues = {
  title: string;
  body: string;
  status: CommunityPostStatus;
  visibility: CommunityPostVisibility;
};

export function CommunityPostForm({
  initialValues,
  saving,
  formError,
  onCancel,
  onSubmit,
}: {
  initialValues: CommunityPostFormValues;
  saving: boolean;
  formError: string | null;
  onCancel: () => void;
  onSubmit: (values: CommunityPostFormValues) => void;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  function update<K extends keyof CommunityPostFormValues>(
    key: K,
    value: CommunityPostFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = {
      title: validateCommunityPostTitle(values.title),
      body: validateCommunityPostBody(values.body),
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.body) return;
    onSubmit({ ...values, title: values.title.trim(), body: values.body.trim() });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="community-post-title">Title</Label>
        <Input
          id="community-post-title"
          maxLength={COMMUNITY_POST_LIMITS.title.max}
          value={values.title}
          aria-invalid={Boolean(errors.title)}
          onChange={(event) => update("title", event.target.value)}
        />
        {errors.title ? <p className="text-sm text-destructive">{errors.title}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="community-post-body">Post</Label>
        <Textarea
          id="community-post-body"
          rows={7}
          maxLength={COMMUNITY_POST_LIMITS.body.max}
          value={values.body}
          aria-invalid={Boolean(errors.body)}
          placeholder="Share an update, idea, opportunity, or piece of work with the community."
          onChange={(event) => update("body", event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {values.body.trim().length}/{COMMUNITY_POST_LIMITS.body.max}
        </p>
        {errors.body ? <p className="text-sm text-destructive">{errors.body}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="community-post-status">Status</Label>
          <Select
            value={values.status}
            onValueChange={(value) => update("status", value as CommunityPostStatus)}
          >
            <SelectTrigger id="community-post-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMMUNITY_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="community-post-visibility">Visibility</Label>
          <Select
            value={values.visibility}
            onValueChange={(value) => update("visibility", value as CommunityPostVisibility)}
          >
            <SelectTrigger id="community-post-visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMMUNITY_VISIBILITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save post"}
        </Button>
      </div>
    </form>
  );
}
