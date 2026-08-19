import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignInBanner({ propertyName }: { propertyName: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-navy/15 bg-navy/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <div>
          <p className="text-sm font-semibold text-navy">
            Sign in to unlock member prices at {propertyName}
          </p>
          <p className="text-xs text-muted-foreground">
            Royal Genius discounts apply to selected dates, stay lengths and room types.
          </p>
        </div>
      </div>
      <Button className="shrink-0 rounded-lg bg-navy text-white hover:bg-navy-light">
        Sign in
      </Button>
    </div>
  );
}
