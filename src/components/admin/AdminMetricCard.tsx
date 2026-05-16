import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AppCard } from "@/components/ui";
import { cn } from "@/lib/utils";

export type AdminMetricTone = "gold" | "green" | "blue" | "red" | "gray";
export type AdminMetricPriority = "primary" | "secondary" | "operational";

const toneClasses: Record<AdminMetricTone, { icon: string; value: string }> = {
  gold: {
    icon: "bg-warning-50 text-warning-600 ring-warning-500/10 dark:bg-warning-500/15 dark:text-warning-500",
    value: "text-gray-900 dark:text-white",
  },
  green: {
    icon: "bg-success-50 text-success-600 ring-success-500/10 dark:bg-success-500/15 dark:text-success-500",
    value: "text-gray-900 dark:text-white",
  },
  blue: {
    icon: "bg-brand-50 text-brand-600 ring-brand-500/10 dark:bg-brand-500/15 dark:text-brand-400",
    value: "text-gray-900 dark:text-white",
  },
  red: {
    icon: "bg-error-50 text-error-600 ring-error-500/10 dark:bg-error-500/15 dark:text-error-500",
    value: "text-gray-900 dark:text-white",
  },
  gray: {
    icon: "bg-gray-100 text-gray-700 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300",
    value: "text-gray-900 dark:text-white",
  },
};

const priorityClasses: Record<AdminMetricPriority, string> = {
  primary: "p-5 md:p-6",
  secondary: "p-5",
  operational: "p-4",
};

export interface AdminMetricCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: AdminMetricTone;
  helper?: ReactNode;
  footer?: ReactNode;
  priority?: AdminMetricPriority;
  className?: string;
}

export function AdminMetricCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  helper,
  footer,
  priority = "secondary",
  className,
}: AdminMetricCardProps) {
  const classes = toneClasses[tone];

  return (
    <AppCard
      className={cn(
        "group h-full bg-white shadow-theme-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-theme-md dark:bg-white/[0.03] dark:hover:border-brand-500/30",
        priorityClasses[priority],
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105",
            classes.icon,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <div
            className={cn(
              "mt-1 flex min-h-8 items-center break-words text-2xl font-semibold tracking-tight",
              classes.value,
            )}
          >
            {value}
          </div>
          {helper ? (
            <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
              {helper}
            </p>
          ) : null}
        </div>
      </div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </AppCard>
  );
}

export default AdminMetricCard;
