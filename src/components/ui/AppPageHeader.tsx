import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AppPageHeaderProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}

export function AppPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  eyebrow,
}: AppPageHeaderProps) {
  return (
    <header className="mb-6 flex min-w-0 flex-col gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-theme-xs font-medium uppercase text-gray-500 dark:text-gray-400">
          {eyebrow ?? (
            <>
              <span>Painel</span>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <span>{title}</span>
            </>
          )}
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-3">
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-brand-50 text-brand-600 dark:border-brand-500/20 dark:bg-brand-500/15 dark:text-brand-400">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
          <h1 className="tailadmin-title min-w-0 break-words text-title-sm font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export default AppPageHeader;
