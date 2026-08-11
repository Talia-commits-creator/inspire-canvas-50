import { ExternalLink, Play } from "lucide-react";
import { MEDIA_TYPE_LABELS, hostnameOf, type PortfolioMediaType } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

export type MediaSource = {
  mediaType: PortfolioMediaType;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  externalUrl: string | null;
  title: string;
};

/**
 * Compact, non-autoplaying preview used inside cards. Heavy media is never
 * loaded here: video and audio show a poster or a quiet placeholder instead.
 */
export function PortfolioPreview({ source, className }: { source: MediaSource; className?: string }) {
  const { mediaType, mediaUrl, thumbnailUrl, externalUrl, title } = source;
  const poster = thumbnailUrl ?? (mediaType === "image" ? mediaUrl : null);

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden bg-secondary", className)}>
      {poster ? (
        <img
          src={poster}
          alt={mediaType === "image" ? title : `Cover image for ${title}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="photo-placeholder grid h-full w-full place-items-center px-4 text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {mediaType === "link" && externalUrl ? hostnameOf(externalUrl) : MEDIA_TYPE_LABELS[mediaType]}
          </span>
        </div>
      )}

      {mediaType === "video" ? (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-overlay px-2 py-1 text-xs font-medium text-background">
          <Play className="size-3.5" aria-hidden />
          Video
        </span>
      ) : null}
      {mediaType === "audio" ? (
        <span className="absolute bottom-2 left-2 rounded-md bg-overlay px-2 py-1 text-xs font-medium text-background">
          Audio
        </span>
      ) : null}
      {mediaType === "link" ? (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-overlay px-2 py-1 text-xs font-medium text-background">
          <ExternalLink className="size-3.5" aria-hidden />
          Link
        </span>
      ) : null}
    </div>
  );
}

/** Full presentation used in the detail view. Controls stay native and accessible. */
export function PortfolioPlayer({ source }: { source: MediaSource }) {
  const { mediaType, mediaUrl, thumbnailUrl, externalUrl, title } = source;

  if (mediaType === "image" && mediaUrl) {
    return (
      <img
        src={mediaUrl}
        alt={title}
        className="max-h-[60vh] w-full rounded-lg object-contain"
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (mediaType === "video" && mediaUrl) {
    return (
      <video
        controls
        preload="metadata"
        playsInline
        poster={thumbnailUrl ?? undefined}
        className="max-h-[60vh] w-full rounded-lg bg-secondary"
        aria-label={`Video: ${title}`}
      >
        <track kind="captions" />
      Your browser cannot play this video.
        <source src={mediaUrl} />
      </video>
    );
  }

  if (mediaType === "audio" && mediaUrl) {
    return (
      <div className="space-y-3">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Cover image for ${title}`}
            className="max-h-64 w-full rounded-lg object-cover"
            loading="lazy"
          />
        ) : null}
        <audio controls preload="none" className="w-full" aria-label={`Audio: ${title}`}>
          <source src={mediaUrl} />
          Your browser cannot play this audio.
        </audio>
      </div>
    );
  }

  if (mediaType === "link" && externalUrl) {
    return (
      <div className="rounded-lg border border-border bg-secondary/50 p-4">
        <p className="text-sm text-muted-foreground">
          This work lives on another site. Opening it will take you away from Inspire to Aspire.
        </p>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
        >
          <ExternalLink className="size-4" aria-hidden />
          {hostnameOf(externalUrl)}
        </a>
      </div>
    );
  }

  return (
    <div className="photo-placeholder grid aspect-[4/3] w-full place-items-center rounded-lg">
      <span className="text-sm text-muted-foreground">Media unavailable</span>
    </div>
  );
}
