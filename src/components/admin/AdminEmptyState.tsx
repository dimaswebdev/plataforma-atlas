import type { LucideIcon } from "lucide-react";
import { AdminCard } from "./AdminCard";

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
    <AdminCard className="px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-500/10 dark:bg-brand-500/15 dark:text-brand-400">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="tailadmin-title text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </AdminCard>
  );
}
