import { cn } from "@/lib/utils";

export type ToggleOption = { id: string; name: string };

/**
 * Accessible multi-select chips. Uses real checkbox semantics so keyboard and
 * screen-reader users get selection state without relying on colour alone.
 */
export function OptionToggleGroup({
  legend,
  description,
  options,
  selected,
  onToggle,
  max,
  error,
  id,
}: {
  legend: string;
  description?: string;
  options: ToggleOption[];
  selected: string[];
  onToggle: (id: string) => void;
  max?: number;
  error?: string;
  id: string;
}) {
  const atLimit = typeof max === "number" && selected.length >= max;

  return (
    <fieldset className="space-y-3" aria-describedby={`${id}-help`}>
      <legend className="text-sm font-medium">{legend}</legend>
      <p id={`${id}-help`} className="text-sm text-muted-foreground">
        {description}
        {typeof max === "number" ? ` Choose up to ${max}. ${selected.length} selected.` : null}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const disabled = !isSelected && atLimit;
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onToggle(option.id)}
              className={cn(
                "inline-flex min-h-9 items-center rounded-lg border px-3 py-1.5 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/30",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {isSelected ? <span aria-hidden className="mr-1.5">✓</span> : null}
              {option.name}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
