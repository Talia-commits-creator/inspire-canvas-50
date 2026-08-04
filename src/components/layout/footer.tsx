import { Link } from "@tanstack/react-router";
import { FOOTER_GROUPS, SITE } from "@/constants/navigation";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-display text-lg font-semibold">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-sm text-primary-foreground">
                {SITE.short}
              </span>
              {SITE.name}
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.tagline}
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {group.title}
              </h4>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="-mx-2 flex min-h-10 items-center rounded-md px-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Built for creators, clients, and communities.</p>
        </div>
      </div>
    </footer>
  );
}
