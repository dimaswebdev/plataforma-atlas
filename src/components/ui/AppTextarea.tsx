import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function AppTextarea({
  className,
  error = false,
  disabled,
  ...props
}: AppTextareaProps) {
  return (
    <textarea
      disabled={disabled}
      aria-invalid={error ? true : props["aria-invalid"]}
      className={cn(
        "min-h-24 w-full resize-y rounded-lg border bg-transparent px-4 py-2.5 text-sm shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 dark:disabled:bg-gray-800",
        error
          ? "border-error-500 text-error-800 focus:border-error-500 focus:ring-error-500/10 dark:text-error-400"
          : "border-gray-300 text-gray-800 dark:border-gray-700",
        className,
      )}
      {...props}
    />
  );
}

export default AppTextarea;
