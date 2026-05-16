import { AppButton } from "@/components/ui";
import type { AppButtonProps } from "@/components/ui";

export type AdminButtonProps = AppButtonProps;

export function AdminButton(props: AdminButtonProps) {
  return <AppButton {...props} />;
}

export default AdminButton;
