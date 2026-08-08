import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/site-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6 sm:py-16">
        <Card>
          <CardHeader>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <CardTitle className="font-display text-2xl sm:text-3xl">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent className="space-y-5">{children}</CardContent>
        </Card>
        {footer ? (
          <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </SiteLayout>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
    >
      {children}
    </Link>
  );
}
