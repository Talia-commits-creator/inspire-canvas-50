import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAvatarUrl, useUploadAvatar, validateAvatarFile } from "@/hooks/use-profile";
import { initialsFrom, profileErrorMessage } from "@/lib/profile";

export function AvatarUploader({
  avatarPath,
  displayName,
  username,
}: {
  avatarPath: string | null;
  displayName: string | null;
  username: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: signedUrl, isLoading: loadingUrl } = useAvatarUrl(avatarPath);
  const upload = useUploadAvatar();
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const invalid = validateAvatarFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    try {
      await upload.mutateAsync(file);
    } catch (err) {
      setError(profileErrorMessage(err instanceof Error ? err.message : undefined));
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary">
        {avatarPath && signedUrl ? (
          <img
            src={signedUrl}
            alt={`${displayName ?? username} profile photo`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-xl font-semibold text-muted-foreground">
            {loadingUrl && avatarPath ? "" : initialsFrom(displayName, username)}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Camera aria-hidden />
          {upload.isPending ? "Uploading…" : avatarPath ? "Replace photo" : "Upload photo"}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Up to 2 MB.</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
