import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppPageHeader } from "@/components/ui";

interface AdminPageHeaderProps {
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  eyebrow,
}: AdminPageHeaderProps) {
  return (
    <AppPageHeader title={title} description={description} icon={Icon} actions={actions} eyebrow={eyebrow} />
  );
}
