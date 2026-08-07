import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-28 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-base leading-relaxed transition-colors",
          "placeholder:text-muted-foreground",
          "hover:border-foreground/25",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
          "aria-invalid:border-destructive aria-invalid:outline-destructive",
          "sm:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
