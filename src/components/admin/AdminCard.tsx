import { AppCard } from "@/components/ui";
import type { AppCardProps } from "@/components/ui";

export type AdminCardProps = AppCardProps;

export function AdminCard(props: AdminCardProps) {
  return <AppCard {...props} />;
}

export default AdminCard;
