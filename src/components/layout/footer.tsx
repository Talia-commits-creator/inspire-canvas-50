import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { FOOTER_GROUPS, SITE } from "@/constants/navigation";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-hero)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            {SITE.name}
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">{SITE.tagline}</p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.title}>
            <h4 className="mb-3 font-display text-sm font-semibold tracking-wide text-foreground">
              {group.title}
            </h4>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Built for creators, clients, and communities.</p>
        </div>
      </div>
    </footer>
  );
}
