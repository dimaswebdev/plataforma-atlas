import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AdminActionTone = "default" | "brand" | "danger";

interface AdminActionMenuProps {
  children: ReactNode;
  className?: string;
}

interface AdminActionIconProps {
  label: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: AdminActionTone;
  className?: string;
}

const toneClasses: Record<AdminActionTone, string> = {
  default: "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
  brand: "text-gray-500 hover:bg-brand-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400",
  danger: "text-gray-500 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-500",
};

export function AdminActionMenu({ children, className }: AdminActionMenuProps) {
  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {children}
    </div>
  );
}

export function AdminActionIcon({
  label,
  children,
  href,
  onClick,
  disabled = false,
  tone = "default",
  className,
}: AdminActionIconProps) {
  const sharedClassName = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/10",
    toneClasses[tone],
    disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={sharedClassName} title={label} aria-label={label}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={sharedClassName}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default AdminActionMenu;
