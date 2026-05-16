import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  children: ReactNode;
  collapsed?: boolean;
  mobile?: boolean;
  open?: boolean;
  className?: string;
}

export function AppSidebar({
  children,
  collapsed = false,
  mobile = false,
  open = false,
  className,
}: AppSidebarProps) {
  if (mobile) {
    return (
      <aside
        className={cn(
          "fixed left-0 top-0 z-[70] h-full w-[min(18rem,85vw)] border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        {children}
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "relative z-40 hidden flex-col border-r border-gray-200 bg-white shadow-theme-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:flex",
        collapsed ? "w-20" : "w-64",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export default AppSidebar;
