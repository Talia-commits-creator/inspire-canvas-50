import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionToggleGroup } from "@/components/creator/option-toggle-group";
import {
  CURRENCY_OPTIONS,
  PRICING_TYPE_OPTIONS,
  SERVICE_LIMITS,
  SERVICE_VISIBILITY_OPTIONS,
  validateServiceCategory,
  validateServiceCurrency,
  validateServiceDescription,
  validateServicePrice,
  validateServiceTitle,
  validateServiceTurnaround,
  type Service,
  type ServiceCategory,
  type ServicePricingType,
  type ServiceVisibility,
} from "@/lib/service";

export type ServiceFormValues = {
  title: string;
  description: string;
  category_id: string;
  pricing_type: ServicePricingType;
  price: string;
  currency: string;
  turnaround_days: string;
  visibility: ServiceVisibility;
};

export const emptyServiceForm: ServiceFormValues = {
  title: "",
  description: "",
  category_id: "",
  pricing_type: "fixed",
  price: "",
  currency: "EUR",
  turnaround_days: "",
  visibility: "public",
};

export function toServiceFormValues(service: Service): ServiceFormValues {
  return {
    title: service.title,
    description: service.description,
    category_id: service.category_id,
    pricing_type: service.pricing_type,
    price: service.price !== null && service.price !== undefined ? String(service.price) : "",
    currency: service.currency || "EUR",
    turnaround_days:
      service.turnaround_days !== null && service.turnaround_days !== undefined
        ? String(service.turnaround_days)
        : "",
    visibility: service.visibility,
  };
}

export function ServiceForm({
  mode,
  values,
  onChange,
  categories,
  onSubmit,
  onCancel,
  saving,
  formError,
}: {
  mode: "create" | "edit";
  values: ServiceFormValues;
  onChange: (values: ServiceFormValues) => void;
  categories: ServiceCategory[];
  onSubmit: (values: ServiceFormValues) => void;
  onCancel: () => void;
  saving: boolean;
  formError: string | null;
}) {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function set<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    onChange({ ...values, [key]: value });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const titleErr = validateServiceTitle(values.title);
    const descErr = validateServiceDescription(values.description);
    const catErr = validateServiceCategory(values.category_id);
    const priceErr = validateServicePrice(values.pricing_type, values.price);
    const currErr = validateServiceCurrency(values.currency);
    const turnErr = validateServiceTurnaround(values.turnaround_days);

    const nextErrors: Record<string, string | undefined> = {
      title: titleErr,
      description: descErr,
      category_id: catErr,
      price: priceErr,
      currency: currErr,
      turnaround_days: turnErr,
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    onSubmit(values);
  }

  const isContact = values.pricing_type === "contact";

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="service-title">Service title</Label>
        <Input
          id="service-title"
          value={values.title}
          maxLength={SERVICE_LIMITS.title.max}
          placeholder="e.g. Graduation Photography, Brand Identity Design"
          onChange={(event) => set("title", event.target.value)}
          aria-invalid={Boolean(errors["title"])}
          aria-describedby={errors["title"] ? "service-title-error" : undefined}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{values.title.trim().length}/{SERVICE_LIMITS.title.max} characters</span>
          {errors["title"] ? (
            <p id="service-title-error" className="text-sm text-destructive" role="alert">
              {errors["title"]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-description">Description</Label>
        <Textarea
          id="service-description"
          rows={4}
          value={values.description}
          maxLength={SERVICE_LIMITS.description.max}
          placeholder="Describe what is included in this service, deliverables, and requirements."
          onChange={(event) => set("description", event.target.value)}
          aria-invalid={Boolean(errors["description"])}
          aria-describedby={errors["description"] ? "service-description-error" : undefined}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{values.description.trim().length}/{SERVICE_LIMITS.description.max} characters</span>
          {errors["description"] ? (
            <p id="service-description-error" className="text-sm text-destructive" role="alert">
              {errors["description"]}
            </p>
          ) : null}
        </div>
      </div>

      <OptionToggleGroup
        id="service-category"
        legend="Category"
        description="Pick the primary category that fits this service best."
        options={categories.map((category) => ({ id: category.id, name: category.name }))}
        selected={values.category_id ? [values.category_id] : []}
        onToggle={(id) => set("category_id", values.category_id === id ? "" : id)}
        error={errors["category_id"]}
      />

      <div className="space-y-3">
        <OptionToggleGroup
          id="service-pricing-type"
          legend="Pricing type"
          description="Choose how clients will be charged for this service."
          options={PRICING_TYPE_OPTIONS.map((option) => ({
            id: option.value,
            name: option.label,
          }))}
          selected={[values.pricing_type]}
          onToggle={(id) => {
            const nextType = id as ServicePricingType;
            if (nextType === "contact") {
              onChange({ ...values, pricing_type: nextType, price: "" });
            } else {
              set("pricing_type", nextType);
            }
          }}
        />

        {!isContact ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <Label htmlFor="service-price">
                {values.pricing_type === "starting_from" ? "Starting price" : "Price"}
              </Label>
              <Input
                id="service-price"
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 80"
                value={values.price}
                onChange={(event) => set("price", event.target.value)}
                aria-invalid={Boolean(errors["price"])}
                aria-describedby={errors["price"] ? "service-price-error" : undefined}
              />
              {errors["price"] ? (
                <p id="service-price-error" className="text-sm text-destructive" role="alert">
                  {errors["price"]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-currency">Currency</Label>
              <Select value={values.currency} onValueChange={(val) => set("currency", val)}>
                <SelectTrigger id="service-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors["currency"] ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors["currency"]}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            Clients will be prompted to contact you directly for a tailored project quote.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-turnaround">Turnaround time (days)</Label>
        <Input
          id="service-turnaround"
          type="number"
          min="1"
          max={SERVICE_LIMITS.turnaroundDays.max}
          step="1"
          placeholder="e.g. 3 (optional)"
          value={values.turnaround_days}
          onChange={(event) => set("turnaround_days", event.target.value)}
          aria-invalid={Boolean(errors["turnaround_days"])}
          aria-describedby={errors["turnaround_days"] ? "service-turnaround-error" : undefined}
        />
        <p className="text-xs text-muted-foreground">
          Estimated delivery duration in days. Leave blank if variable.
        </p>
        {errors["turnaround_days"] ? (
          <p id="service-turnaround-error" className="text-sm text-destructive" role="alert">
            {errors["turnaround_days"]}
          </p>
        ) : null}
      </div>

      <OptionToggleGroup
        id="service-visibility"
        legend="Visibility"
        description={
          values.visibility === "public"
            ? "Shown on your public creator profile."
            : "Only you can see this in your service manager."
        }
        options={SERVICE_VISIBILITY_OPTIONS.map((option) => ({
          id: option.value,
          name: option.label,
        }))}
        selected={[values.visibility]}
        onToggle={(id) => set("visibility", id as ServiceVisibility)}
      />

      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Add service" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
