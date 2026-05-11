import type { LucideIcon } from "lucide-react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function AdminEmptyState({
  title,
  description,
  icon: Icon,
}: AdminEmptyStateProps) {
  return (
    <section className="atlas-empty-state">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-atlas-navy-aero/30 bg-white/[0.04] text-atlas-gold-main">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="atlas-section-title text-white">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-atlas-text-muted">
        {description}
      </p>
    </section>
  );
}
