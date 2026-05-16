import { TailAdminBadge } from "@/components/ui-tailadmin";
import type { TailAdminBadgeProps } from "@/components/ui-tailadmin";

export type AppBadgeProps = TailAdminBadgeProps;

export function AppBadge(props: AppBadgeProps) {
  return <TailAdminBadge {...props} />;
}

export default AppBadge;
