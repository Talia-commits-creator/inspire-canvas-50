import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CreatorSettingsTab = "profile" | "services" | "portfolio" | "bookings";

interface CreatorSettingsNavProps {
  currentTab: CreatorSettingsTab;
  publicUsername?: string | null;
}

const TABS: { id: CreatorSettingsTab; label: string; to: string }[] = [
  { id: "profile", label: "Profile", to: "/settings/creator" },
  { id: "services", label: "Services", to: "/settings/creator/services" },
  { id: "portfolio", label: "Portfolio", to: "/settings/creator/portfolio" },
  { id: "bookings", label: "Booking Requests", to: "/settings/creator/bookings" },
];

export function CreatorSettingsNav({ currentTab, publicUsername }: CreatorSettingsNavProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Creator sections" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link key={tab.id} to={tab.to}>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs sm:h-9 sm:text-sm"
              >
                {tab.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {publicUsername ? (
        <Link to="/creators/$username" params={{ username: publicUsername }}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground sm:h-9 sm:text-sm"
          >
            <span>View public profile</span>
            <ExternalLink className="size-3.5" aria-hidden />
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
