import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-navy">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground" : undefined}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
