import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AlertCircle, Info, Moon, Sun } from "lucide-react";

import { SiteLayout } from "@/components/layout/site-layout";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CreatorCard } from "@/components/entities/creator-card";
import { OrganizationCard } from "@/components/entities/organization-card";
import { ProjectCard } from "@/components/entities/project-card";
import { CREATOR_SAMPLES, ORGANIZATION_SAMPLES, PROJECT_SAMPLES } from "@/data/showcase";
import { PRIMARY_NAV, MOBILE_NAV, SITE } from "@/constants/navigation";
import { useTheme } from "@/providers/theme-provider";

export const Route = createFileRoute("/styleguide")({
  head: () => ({
    meta: [
      { title: "Style Guide — Inspire to Aspire" },
      {
        name: "description",
        content:
          "Internal design system reference for Inspire to Aspire: typography, colour tokens, components and entity card patterns.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Style Guide — Inspire to Aspire" },
      {
        property: "og:description",
        content: "Internal reference for the Inspire to Aspire design system.",
      },
    ],
  }),
  component: StyleGuidePage,
});

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <div className="mb-5 border-b border-border pb-3">
        <h2 id={`${id}-heading`} className="font-display text-xl font-semibold sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="min-w-0">
      <div className={`h-16 rounded-lg border border-border ${className}`} />
      <p className="mt-2 truncate text-xs text-muted-foreground">{name}</p>
    </div>
  );
}

const SECTIONS = [
  ["brand", "Brand"],
  ["typography", "Typography"],
  ["colors", "Colours"],
  ["radius", "Radius & elevation"],
  ["buttons", "Buttons"],
  ["inputs", "Inputs"],
  ["cards", "Cards"],
  ["badges", "Badges"],
  ["navigation", "Navigation"],
  ["feedback", "Feedback"],
  ["overlays", "Overlays"],
  ["entities", "Entity cards"],
] as const;

function StyleGuidePage() {
  const { theme, toggle } = useTheme();
  const [invalid] = useState(true);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Internal reference"
        title="Design system style guide"
        description="A working reference for the Inspire to Aspire visual language: tokens, primitives, and reusable content patterns."
        actions={
          <Button variant="outline" onClick={toggle}>
            {theme === "dark" ? <Sun /> : <Moon />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <nav aria-label="Style guide sections" className="mb-10">
          <ul className="flex flex-wrap gap-2">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex min-h-9 items-center rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-14">
          <Section id="brand" title="Brand" description="Wordmark, voice, and core palette.">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary font-display text-base font-semibold text-primary-foreground">
                    {SITE.short}
                  </span>
                  <span className="font-display text-2xl font-semibold tracking-tight">
                    {SITE.name}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{SITE.tagline}</p>
              </Card>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Swatch name="Primary teal" className="bg-primary" />
                <Swatch name="Warm gold" className="bg-gold" />
                <Swatch name="Soft coral" className="bg-coral" />
                <Swatch name="Background" className="bg-background" />
              </div>
            </div>
          </Section>

          <Section
            id="typography"
            title="Typography"
            description="Fredoka for display and headings. Inter for body, UI and labels."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Fredoka — display
                </p>
                <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  Hero heading
                </p>
                <p className="mt-4 font-display text-3xl font-semibold tracking-tight">H1 heading</p>
                <p className="mt-3 font-display text-2xl font-semibold tracking-tight">H2 heading</p>
                <p className="mt-3 font-display text-xl font-semibold tracking-tight">H3 heading</p>
              </Card>
              <Card className="p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Inter — body and UI
                </p>
                <p className="text-base leading-relaxed">
                  Body text sets the pace of the platform. It stays comfortable at small sizes and
                  gives long descriptions room to breathe.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Supporting text carries secondary detail such as location, category or status.
                </p>
                <p className="mt-4 text-sm font-medium">Label text</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <Button size="sm">Button text</Button>
                  <Link
                    to="/about"
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Inline link
                  </Link>
                </div>
              </Card>
            </div>
          </Section>

          <Section
            id="colors"
            title="Colours"
            description="Semantic tokens only. Toggle the theme above to inspect dark mode."
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Swatch name="background" className="bg-background" />
              <Swatch name="foreground" className="bg-foreground" />
              <Swatch name="card" className="bg-card" />
              <Swatch name="muted" className="bg-muted" />
              <Swatch name="secondary" className="bg-secondary" />
              <Swatch name="primary" className="bg-primary" />
              <Swatch name="primary-foreground" className="bg-primary-foreground" />
              <Swatch name="accent" className="bg-accent" />
              <Swatch name="gold" className="bg-gold" />
              <Swatch name="coral" className="bg-coral" />
              <Swatch name="success" className="bg-success" />
              <Swatch name="destructive" className="bg-destructive" />
              <Swatch name="border" className="bg-border" />
              <Swatch name="input" className="bg-input" />
              <Swatch name="ring (focus)" className="bg-ring" />
            </div>
          </Section>

          <Section
            id="radius"
            title="Radius & elevation"
            description="Three radius levels and three elevation levels. Nothing else."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-card p-5 text-sm">
                <p className="font-medium">rounded-md</p>
                <p className="mt-1 text-muted-foreground">Menu items, chips, small controls</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 text-sm">
                <p className="font-medium">rounded-lg</p>
                <p className="mt-1 text-muted-foreground">Buttons, inputs, selects, tabs</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-sm">
                <p className="font-medium">rounded-xl</p>
                <p className="mt-1 text-muted-foreground">Cards, dialogs, sheets, popovers</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-5 text-sm elevation-soft">
                elevation-soft
              </div>
              <div className="rounded-lg border border-border bg-card p-5 text-sm elevation-raised">
                elevation-raised
              </div>
              <div className="rounded-lg border border-border bg-card p-5 text-sm elevation-overlay">
                elevation-overlay
              </div>
            </div>
          </Section>

          <Section id="buttons" title="Buttons" description="Variants, sizes and states.">
            <div className="grid gap-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="coral">Coral</Button>
                <Button variant="gold">Gold</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Toggle theme">
                  <Sun />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled outline
                </Button>
                <Button aria-busy="true" disabled>
                  Saving…
                </Button>
              </div>
            </div>
          </Section>

          <Section
            id="inputs"
            title="Inputs"
            description="All form controls share the same border, radius, focus ring and error treatment."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="sg-name">Full name</Label>
                  <Input id="sg-name" placeholder="Amara Boateng" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sg-email">Email</Label>
                  <Input
                    id="sg-email"
                    type="email"
                    defaultValue="not-an-email"
                    aria-invalid={invalid}
                    aria-describedby="sg-email-error"
                  />
                  <p id="sg-email-error" className="text-sm text-destructive">
                    Enter a valid email address.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sg-disabled">Disabled</Label>
                  <Input id="sg-disabled" placeholder="Unavailable" disabled />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sg-bio">Short description</Label>
                  <Textarea id="sg-bio" placeholder="Tell people what you make." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sg-category">Creative category</Label>
                  <Select>
                    <SelectTrigger id="sg-category">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid content-start gap-6">
                <fieldset className="grid gap-3">
                  <legend className="mb-1 text-sm font-medium">Checkboxes</legend>
                  <div className="flex items-center gap-3">
                    <Checkbox id="sg-cb1" defaultChecked />
                    <Label htmlFor="sg-cb1">Open to commissions</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="sg-cb2" />
                    <Label htmlFor="sg-cb2">Show my location publicly</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="sg-cb3" disabled />
                    <Label htmlFor="sg-cb3" className="text-muted-foreground">
                      Disabled option
                    </Label>
                  </div>
                </fieldset>

                <Separator />

                <fieldset className="grid gap-3">
                  <legend className="mb-1 text-sm font-medium">Radio group</legend>
                  <RadioGroup defaultValue="creator">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="creator" id="sg-r1" />
                      <Label htmlFor="sg-r1">Creator</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="organization" id="sg-r2" />
                      <Label htmlFor="sg-r2">Organization</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="audience" id="sg-r3" disabled />
                      <Label htmlFor="sg-r3" className="text-muted-foreground">
                        Audience (coming soon)
                      </Label>
                    </div>
                  </RadioGroup>
                </fieldset>

                <Separator />

                <div className="grid gap-3">
                  <p className="text-sm font-medium">Switches</p>
                  <div className="flex items-center gap-3">
                    <Switch id="sg-sw1" defaultChecked />
                    <Label htmlFor="sg-sw1">Email notifications</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="sg-sw2" disabled />
                    <Label htmlFor="sg-sw2" className="text-muted-foreground">
                      Disabled switch
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section id="cards" title="Cards" description="One card surface, several densities.">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Standard card</CardTitle>
                  <CardDescription>Header, description and content, no imagery.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  Use for grouped information and settings panels.
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="photo-placeholder aspect-[16/9] w-full" aria-hidden="true" />
                <CardHeader>
                  <CardTitle>Media card</CardTitle>
                  <CardDescription>Photography leads, text supports.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-secondary">
                <CardHeader>
                  <CardTitle>Quiet card</CardTitle>
                  <CardDescription>
                    A muted surface for secondary or contextual content.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Section>

          <Section id="badges" title="Badges" description="Status and category labels.">
            <div className="flex flex-wrap gap-2">
              <Badge>Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="gold">Featured</Badge>
              <Badge variant="coral">Action</Badge>
              <Badge variant="success">Available</Badge>
              <Badge variant="muted">Archived</Badge>
              <Badge variant="outline">Category</Badge>
              <Badge variant="destructive">Removed</Badge>
            </div>
          </Section>

          <Section
            id="navigation"
            title="Navigation"
            description="Desktop shows the full set; mobile keeps the five highest-value destinations."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Desktop
                </p>
                <div className="flex flex-wrap gap-1">
                  {PRIMARY_NAV.map((item) => (
                    <span
                      key={item.to}
                      className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Mobile
                </p>
                <div className="grid gap-1">
                  {MOBILE_NAV.map((item) => (
                    <span
                      key={item.to}
                      className="flex min-h-11 items-center rounded-md px-3 text-base font-medium text-muted-foreground"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </Section>

          <Section
            id="feedback"
            title="Feedback"
            description="Alerts, toasts, loading, empty and error states."
          >
            <div className="grid gap-5">
              <div className="grid gap-3">
                <Alert>
                  <Info aria-hidden="true" />
                  <AlertTitle>Default alert</AlertTitle>
                  <AlertDescription>Neutral information on the card surface.</AlertDescription>
                </Alert>
                <Alert variant="info">
                  <Info aria-hidden="true" />
                  <AlertTitle>Informational</AlertTitle>
                  <AlertDescription>Guidance tied to the primary brand colour.</AlertDescription>
                </Alert>
                <Alert variant="success">
                  <Info aria-hidden="true" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Your changes have been saved.</AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <AlertCircle aria-hidden="true" />
                  <AlertTitle>Needs attention</AlertTitle>
                  <AlertDescription>Add a profile photo before publishing.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle aria-hidden="true" />
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>We could not load this section. Try again.</AlertDescription>
                </Alert>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => toast("Profile draft saved")}>
                  Show toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.success("Profile published", { description: "Visible to everyone." })}
                >
                  Success toast
                </Button>
                <Button variant="outline" onClick={() => toast.error("Upload failed")}>
                  Error toast
                </Button>
              </div>

              <Card className="p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Loading
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="grid content-start gap-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-11 w-32 rounded-lg" />
                  </div>
                </div>
              </Card>

              <div className="grid gap-5 lg:grid-cols-2">
                <EmptyState
                  title="No projects yet"
                  description="When projects are published they will appear here."
                  action={<Button variant="outline">Browse creators</Button>}
                />
                <EmptyState
                  title="This page didn't load"
                  description="Something went wrong on our end. Try refreshing."
                  action={<Button>Try again</Button>}
                />
              </div>
            </div>
          </Section>

          <Section
            id="overlays"
            title="Overlays"
            description="Dialog, sheet, dropdown, popover and tooltip share one surface treatment."
          >
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish your profile</DialogTitle>
                    <DialogDescription>
                      Your profile will be visible in Discover and searchable by organizations.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost">Cancel</Button>
                    <Button>Publish</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Narrow results by category and location.</SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sg-sheet-loc">Location</Label>
                      <Input id="sg-sheet-loc" placeholder="Anywhere" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="sg-sheet-avail" />
                      <Label htmlFor="sg-sheet-avail">Available now</Label>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Open dropdown</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuItem>Most recent</DropdownMenuItem>
                  <DropdownMenuItem>Most relevant</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Reset</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open popover</Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <p className="font-display text-sm font-semibold">Availability</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Creators set their own availability. It is shown as a label, never as colour
                    alone.
                  </p>
                </PopoverContent>
              </Popover>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover for tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>Short, supporting detail only.</TooltipContent>
              </Tooltip>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="one">
                <TabsList>
                  <TabsTrigger value="one">Overview</TabsTrigger>
                  <TabsTrigger value="two">Work</TabsTrigger>
                  <TabsTrigger value="three">Services</TabsTrigger>
                </TabsList>
                <TabsContent value="one" className="text-sm leading-relaxed text-muted-foreground">
                  Tabs use the secondary surface with a card-coloured active state.
                </TabsContent>
                <TabsContent value="two" className="text-sm leading-relaxed text-muted-foreground">
                  Second panel.
                </TabsContent>
                <TabsContent value="three" className="text-sm leading-relaxed text-muted-foreground">
                  Third panel.
                </TabsContent>
              </Tabs>
            </div>
          </Section>

          <Section
            id="entities"
            title="Entity cards"
            description="Reusable patterns for creators, organizations and projects. Placeholder content only."
          >
            <div className="grid gap-8">
              <div>
                <h3 className="mb-4 font-display text-lg font-semibold">Creator card</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {CREATOR_SAMPLES.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 font-display text-lg font-semibold">Organization card</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {ORGANIZATION_SAMPLES.map((organization) => (
                    <OrganizationCard key={organization.id} organization={organization} />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 font-display text-lg font-semibold">Project card</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {PROJECT_SAMPLES.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </SiteLayout>
  );
}
