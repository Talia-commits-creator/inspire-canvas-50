import { ArrowDown, ArrowUp, Clock, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatServicePrice,
  formatTurnaround,
  PRICING_TYPE_LABELS,
  type Service,
  type ServiceCategory,
} from "@/lib/service";

export function ServiceManagerCard({
  item,
  categories,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMove,
  isFirst,
  isLast,
  busy,
}: {
  item: Service;
  categories: ServiceCategory[];
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onMove: (direction: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
}) {
  const category = categories.find((entry) => entry.id === item.category_id);
  const formattedPrice = formatServicePrice(item.pricing_type, item.price, item.currency);
  const turnaroundText = formatTurnaround(item.turnaround_days);

  return (
    <li className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {category ? <Badge variant="secondary">{category.name}</Badge> : null}
          <Badge variant="outline">{PRICING_TYPE_LABELS[item.pricing_type]}</Badge>
          <Badge variant={item.visibility === "public" ? "success" : "muted"}>
            {item.visibility === "public" ? "Public" : "Private"}
          </Badge>
          {turnaroundText ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
              {turnaroundText}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="truncate font-display text-lg font-semibold">{item.title}</h3>
            <span className="font-display text-base font-semibold text-foreground">
              {formattedPrice}
            </span>
          </div>
          {item.description ? (
            <p className="whitespace-pre-line text-sm text-muted-foreground line-clamp-3">
              {item.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 mt-2 border-t border-border">
        <Button type="button" variant="outline" size="sm" onClick={onEdit} disabled={busy}>
          <Pencil className="size-4" aria-hidden />
          Edit
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
    </li>
  );
}
