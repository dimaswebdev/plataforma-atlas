import type { ReactNode } from "react";
import { AppSection } from "@/components/ui";

interface AdminSectionProps {
  children?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function AdminSection(props: AdminSectionProps) {
  return <AppSection {...props} />;
}

export default AdminSection;
