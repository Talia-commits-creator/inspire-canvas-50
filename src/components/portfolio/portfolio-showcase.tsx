import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PortfolioPlayer, PortfolioPreview } from "@/components/portfolio/portfolio-media";
import { MEDIA_TYPE_LABELS, hostnameOf, type PublicPortfolioItem } from "@/lib/portfolio";

/** Public, read-only portfolio grid with a detail dialog. */
export function PortfolioShowcase({
  items,
  creatorName,
}: {
  items: PublicPortfolioItem[];
  creatorName: string;
}) {
  const [active, setActive] = useState<PublicPortfolioItem | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {creatorName} hasn't published any work yet.
      </p>
    );
  }

  const featured = items.filter((item) => item.is_featured);
  const rest = items.filter((item) => !item.is_featured);

  return (
    <>
      {featured.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-sm font-medium">Featured work</h3>
          <ItemGrid items={featured} onOpen={setActive} />
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="space-y-3 pt-6">
          {featured.length > 0 ? <h3 className="text-sm font-medium">More work</h3> : null}
          <ItemGrid items={rest} onOpen={setActive} />
        </section>
      ) : null}

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
                <DialogDescription>
                  {active.category ? `${active.category.name} · ` : ""}
                  {MEDIA_TYPE_LABELS[active.media_type]} by {creatorName}
                </DialogDescription>
              </DialogHeader>

              <PortfolioPlayer
                source={{
                  mediaType: active.media_type,
                  mediaUrl: active.media_url,
                  thumbnailUrl: active.thumbnail_url,
                  externalUrl: active.external_url,
                  title: active.title,
                }}
              />

              {active.description ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {active.description}
                </p>
              ) : null}

              {active.media_type !== "link" && active.external_url ? (
                <a
                  href={active.external_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  {hostnameOf(active.external_url)}
                </a>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ItemGrid({
  items,
  onOpen,
}: {
  items: PublicPortfolioItem[];
  onOpen: (item: PublicPortfolioItem) => void;
}) {
  return (
    <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpen(item)}
            className="block h-auto w-full overflow-hidden rounded-xl border border-border bg-card p-0 text-left hover:bg-card"
          >
            <PortfolioPreview
              source={{
                mediaType: item.media_type,
                mediaUrl: item.media_url,
                thumbnailUrl: item.thumbnail_url,
                externalUrl: item.external_url,
                title: item.title,
              }}
            />
            <span className="block space-y-2 p-4">
              <span className="block truncate font-display text-base font-semibold">{item.title}</span>
              {item.category ? (
                <Badge variant="secondary">{item.category.name}</Badge>
              ) : (
                <Badge variant="outline">{MEDIA_TYPE_LABELS[item.media_type]}</Badge>
              )}
            </span>
          </Button>
        </li>
      ))}
    </ul>
  );
}
