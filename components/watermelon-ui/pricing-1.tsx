import { MdCheckCircle } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PricingFeature {
  text: string;
}

export interface PricingPlan {
  id: string;
  href?: string;
  title: string;
  description: string;
  price: string;
  priceSuffix?: string;
  features: PricingFeature[];
  buttonText: string;
  isPopular?: boolean;
}

export interface Pricing1Props {
  plans: PricingPlan[];
  className?: string;
}

export function Pricing1({ plans, className }: Pricing1Props) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 md:px-6", className)}>
      <div className="bg-muted/40 rounded-none border p-2 md:p-3">
        <div
          className={cn(
            "grid grid-cols-1 gap-2",
            plans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3",
          )}
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-none p-6 transition-all sm:p-8",
                plan.isPopular
                  ? "bg-background border-border/50 border"
                  : "hover:bg-background/50 bg-transparent",
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-6 right-6">
                  <Badge
                    variant="default"
                    className="rounded-none px-3 py-1 text-xs font-semibold"
                  >
                    Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-foreground mb-3 text-2xl font-bold tracking-tight">
                  {plan.title}
                </h3>
                <p className="text-muted-foreground min-h-[40px] pr-8 text-sm sm:pr-12">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-foreground text-5xl font-extrabold tracking-tight">
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span className="text-muted-foreground text-sm font-medium">
                    {plan.priceSuffix}
                  </span>
                )}
              </div>

              <div className="bg-border mb-8 h-[2px] w-1/3" />

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <MdCheckCircle className="text-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <span className="text-muted-foreground text-sm font-medium">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <a href={plan.href ?? "#"} className="mt-auto block pt-4">
                <span
                  className={cn(
                    "flex h-14 w-full items-center justify-between rounded-none px-6 text-base font-semibold transition-colors",
                    plan.isPopular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border text-foreground hover:bg-foreground/5 border",
                  )}
                >
                  <span>Get started for</span>
                  <span
                    className={cn(
                      "mx-4 h-px flex-1",
                      plan.isPopular ? "bg-primary-foreground/40" : "bg-border",
                    )}
                  />
                  <span>{plan.buttonText}</span>
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
