import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { PRIMARY_NAV, MOBILE_NAV } from "@/constants/navigation";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const { session, user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      setOpen(false);
      toast.success("You have been signed out.");
      navigate({ to: "/", replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E1D8]/20 bg-[#111111] text-[#FAF7F2] backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:h-18 lg:px-8">
        <Link
          to="/"
          className="flex min-w-0 items-center rounded-md"
        >
          <img
            src="/images/darey-creatives-logo.png"
            alt="DAREY CREATIVES"
            className="h-10 w-auto shrink-0 object-contain md:h-12 lg:h-14"
          />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="hidden items-center gap-0.5 xl:gap-1 lg:flex">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="shrink-0 rounded-full px-2 py-2 text-xs font-medium text-[#FAF7F2]/75 transition-colors hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2] xl:px-3 xl:text-sm"
                activeProps={{ className: "text-[#FAF7F2] font-semibold" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#FAF7F2] hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2]"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>

          <div className="hidden items-center gap-2 sm:flex">
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded-lg bg-secondary" aria-hidden />
            ) : session && user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-[#FAF7F2] hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2]">
                    Dashboard
                  </Button>
                </Link>
                <Button size="sm" variant="outline" className="border-[#E8E1D8]/50 text-[#FAF7F2] hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2]" onClick={handleSignOut} disabled={signingOut}>
                  {signingOut ? "Logging out…" : "Log out"}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-[#FAF7F2] hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2]">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Join Now</Button>
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-[#FAF7F2] hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2] lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:px-6">
            {MOBILE_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
              {loading ? (
                <div
                  className="col-span-2 h-10 w-full animate-pulse rounded-md bg-secondary"
                  aria-hidden
                />
              ) : session && user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button className="w-full" onClick={handleSignOut} disabled={signingOut}>
                    {signingOut ? "Logging out…" : "Log out"}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Join Now</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
