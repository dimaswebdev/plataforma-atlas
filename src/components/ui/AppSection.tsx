import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppPageProps {
  children: ReactNode;
  className?: string;
}

interface AppSectionProps {
  children?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function AppPage({ children, className }: AppPageProps) {
  return (
    <div className={cn("tailadmin-surface min-h-full rounded-2xl p-3 sm:p-4 lg:p-5", className)}>
      {children}
    </div>
  );
}

export function AppSectionHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: Omit<AppSectionProps, "children" | "contentClassName">) {
  if (!title && !description && !eyebrow && !actions) return null;

  return (
    <div
      className={cn(
        "mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 className="tailadmin-title mt-1 text-base font-semibold text-gray-900 dark:text-white/90">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function AppSection({
  children,
  title,
  description,
  eyebrow,
  actions,
  className,
  headerClassName,
  contentClassName,
}: AppSectionProps) {
  return (
    <section className={cn("min-w-0", className)}>
      <AppSectionHeader
        title={title}
        description={description}
        eyebrow={eyebrow}
        actions={actions}
        className={headerClassName}
      />
      {children ? <div className={contentClassName}>{children}</div> : null}
    </section>
  );
}

export default AppSection;
