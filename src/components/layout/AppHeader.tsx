import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  children: ReactNode;
  mobile?: boolean;
  className?: string;
}

export function AppHeader({ children, mobile = false, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        mobile
          ? "flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden"
          : "hidden h-[76px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900 lg:flex",
        className,
      )}
    >
      {children}
    </header>
  );
}

export default AppHeader;
