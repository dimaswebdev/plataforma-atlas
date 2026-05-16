import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  theme?: "light" | "dark";
  sidebar?: ReactNode;
  mobileSidebar?: ReactNode;
  header?: ReactNode;
  mobileHeader?: ReactNode;
  mobileOverlay?: ReactNode;
  floatingLayer?: ReactNode;
  className?: string;
}

export function AppShell({
  children,
  theme = "light",
  sidebar,
  mobileSidebar,
  header,
  mobileHeader,
  mobileOverlay,
  floatingLayer,
  className,
}: AppShellProps) {
  return (
    <div
      data-admin-theme={theme}
      className={cn(
        "atlas-admin-shell relative flex h-dvh min-w-0 overflow-hidden bg-gray-50 font-tailadmin text-gray-900 dark:bg-gray-950 dark:text-white",
        theme === "dark" && "dark",
        className,
      )}
    >
      {sidebar}
      {mobileOverlay}
      {mobileSidebar}

      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {header}
        {mobileHeader}
        {floatingLayer}
        <main className="custom-scrollbar min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-950">
          <div className="mx-auto w-full max-w-none min-w-0 p-3 sm:p-4 lg:p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
