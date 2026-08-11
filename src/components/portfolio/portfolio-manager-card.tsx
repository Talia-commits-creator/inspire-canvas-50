import { ArrowDown, ArrowUp, Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortfolioPreview } from "@/components/portfolio/portfolio-media";
import { usePortfolioMediaUrl } from "@/hooks/use-portfolio";
import { MEDIA_TYPE_LABELS, type PortfolioCategory, type PortfolioItem } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

/**
 * A single owned item. Signed URLs are fetched per item so private media never
 * needs a public bucket, and lazy <img> loading keeps long grids cheap.
 */
export function PortfolioManagerCard({
  item,
  categories,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleVisibility,
  onMove,
  isFirst,
  isLast,
  busy,
}: {
  item: PortfolioItem;
  categories: PortfolioCategory[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: () => void;
  onToggleVisibility: () => void;
  onMove: (direction: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
}) {
  const previewPath = item.thumbnail_path ?? (item.media_type === "image" ? item.media_path : null);
  const previewUrl = usePortfolioMediaUrl(previewPath).data ?? null;
  const category = categories.find((entry) => entry.id === item.category_id);

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card">
      <PortfolioPreview
        source={{
          mediaType: item.media_type,
          mediaUrl: item.media_type === "image" ? previewUrl : null,
          thumbnailUrl: item.thumbnail_path ? previewUrl : null,
          externalUrl: item.external_url,
          title: item.title,
        }}
      />

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{MEDIA_TYPE_LABELS[item.media_type]}</Badge>
          {category ? <Badge variant="secondary">{category.name}</Badge> : null}
          <Badge variant={item.visibility === "public" ? "success" : "muted"}>
            {item.visibility === "public" ? "Public" : "Private"}
          </Badge>
          {item.is_featured ? <Badge variant="gold">Featured</Badge> : null}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-semibold">{item.title}</h3>
          {item.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={onEdit} disabled={busy}>
            <Pencil className="size-4" aria-hidden />
            Edit
          </Button>
          <Button
            type="button"
            variant={item.is_featured ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleFeatured}
            disabled={busy}
            aria-pressed={item.is_featured}
          >
            <Star className={cn("size-4", item.is_featured && "fill-current")} aria-hidden />
            {item.is_featured ? "Featured" : "Feature"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onToggleVisibility} disabled={busy}>
            {item.visibility === "public" ? "Make private" : "Make public"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onMove(-1)}
            disabled={busy || isFirst}
            aria-label={`Move ${item.title} earlier`}
          >
            <ArrowUp className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onMove(1)}
            disabled={busy || isLast}
            aria-label={`Move ${item.title} later`}
          >
            <ArrowDown className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={busy}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
        </div>
      </div>
    </li>
  );
}
