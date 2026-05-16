import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TailAdminBadgeVariant = "light" | "solid";
type TailAdminBadgeSize = "sm" | "md";
type TailAdminBadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

export interface TailAdminBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TailAdminBadgeVariant;
  size?: TailAdminBadgeSize;
  color?: TailAdminBadgeColor;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const sizeClasses: Record<TailAdminBadgeSize, string> = {
  sm: "px-2 py-0.5 text-theme-xs",
  md: "px-2.5 py-0.5 text-sm",
};

const variantClasses: Record<
  TailAdminBadgeVariant,
  Record<TailAdminBadgeColor, string>
> = {
  light: {
    primary: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
    success: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
    error: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500",
    warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500",
    info: "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-500",
    light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
    dark: "bg-gray-500 text-white dark:bg-white/10 dark:text-white",
  },
  solid: {
    primary: "bg-brand-500 text-white",
    success: "bg-success-500 text-white",
    error: "bg-error-500 text-white",
    warning: "bg-warning-500 text-white",
    info: "bg-blue-light-500 text-white",
    light: "bg-gray-400 text-white dark:bg-white/10 dark:text-white/80",
    dark: "bg-gray-700 text-white dark:bg-white/10",
  },
};

export function TailAdminBadge({
  children,
  className,
  variant = "light",
  size = "md",
  color = "primary",
  startIcon,
  endIcon,
  ...props
}: TailAdminBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full font-medium",
        sizeClasses[size],
        variantClasses[variant][color],
        className,
      )}
      {...props}
    >
      {startIcon ? <span className="flex shrink-0 items-center">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="flex shrink-0 items-center">{endIcon}</span> : null}
    </span>
  );
}

export default TailAdminBadge;
