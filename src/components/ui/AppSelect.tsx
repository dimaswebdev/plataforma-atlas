import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AppSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: AppSelectOption[];
  placeholder?: string;
  error?: boolean;
}

export function AppSelect({
  options,
  placeholder,
  className,
  error = false,
  defaultValue,
  value,
  ...props
}: AppSelectProps) {
  const hasPlaceholder = typeof placeholder === "string" && placeholder.length > 0;

  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-lg border bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 dark:disabled:bg-gray-800",
          error
            ? "border-error-500 text-error-800 focus:border-error-500 focus:ring-error-500/10 dark:text-error-400"
            : "border-gray-300 text-gray-800 dark:border-gray-700",
          className,
        )}
        defaultValue={defaultValue ?? (hasPlaceholder && value === undefined ? "" : undefined)}
        value={value}
        {...props}
      >
        {hasPlaceholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
      />
    </div>
  );
}

export default AppSelect;
