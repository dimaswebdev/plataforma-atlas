import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminTableToolbarProps {
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function AdminTableToolbar({
  left,
  right,
  children,
  className,
}: AdminTableToolbarProps) {
  if (!left && !right && !children) return null;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 border-b border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-transparent sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children ? children : (
        <>
          <div className="min-w-0">{left}</div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div>
        </>
      )}
    </div>
  );
}

export default AdminTableToolbar;
