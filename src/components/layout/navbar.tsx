import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sparkles, Sun, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";
import { PRIMARY_NAV, SITE } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">{SITE.name}</span>
          <span className="sm:hidden">{SITE.short}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              )}
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/register" className="hidden sm:block">
            <Button size="sm">Get started</Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:px-6">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border/60 pt-3">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1">
                <Button variant="outline" className="w-full" size="sm">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)} className="flex-1">
                <Button className="w-full" size="sm">Get started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
