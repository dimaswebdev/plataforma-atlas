import { AppBadge } from "@/components/ui";
import type { AppBadgeProps } from "@/components/ui";

export type AdminBadgeProps = AppBadgeProps;

export function AdminBadge(props: AdminBadgeProps) {
  return <AppBadge {...props} />;
}

export default AdminBadge;
