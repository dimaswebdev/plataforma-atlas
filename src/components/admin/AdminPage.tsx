import type { ReactNode } from "react";
import { AppPage } from "@/components/ui";
import { cn } from "@/lib/utils";

interface AdminPageProps {
  children: ReactNode;
  className?: string;
}

export function AdminPage({ children, className }: AdminPageProps) {
  return (
    <AppPage className={cn("space-y-6", className)}>
      {children}
    </AppPage>
  );
}

export default AdminPage;
