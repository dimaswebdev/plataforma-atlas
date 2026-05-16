import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TailAdminButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type TailAdminButtonSize = "sm" | "md" | "lg" | "icon";

export interface TailAdminButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TailAdminButtonVariant;
  size?: TailAdminButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const sizeClasses: Record<TailAdminButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

const variantClasses: Record<TailAdminButtonVariant, string> = {
  primary:
    "bg-brand-500 !text-white shadow-theme-xs hover:bg-brand-600 focus-visible:ring-brand-500/20 disabled:bg-brand-300 dark:bg-brand-500 dark:hover:bg-brand-600",
  secondary:
    "bg-gray-100 text-gray-700 shadow-theme-xs hover:bg-gray-200 focus-visible:ring-gray-500/10 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.06]",
  outline:
    "border border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 focus-visible:ring-brand-500/10 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.03]",
  ghost:
    "text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-gray-500/10 disabled:text-gray-400 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
  danger:
    "bg-error-500 !text-white shadow-theme-xs hover:bg-error-600 focus-visible:ring-error-500/20 disabled:bg-error-300",
  success:
    "bg-success-500 !text-white shadow-theme-xs hover:bg-success-600 focus-visible:ring-success-500/20 disabled:bg-success-300",
};

export function TailAdminButton({
  children,
  className,
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  fullWidth = false,
  loading = false,
  disabled,
  type = "button",
  ...props
}: TailAdminButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-70",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {startIcon ? <span className="flex shrink-0 items-center">{startIcon}</span> : null}
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
      {endIcon ? <span className="flex shrink-0 items-center">{endIcon}</span> : null}
    </button>
  );
}

export default TailAdminButton;
