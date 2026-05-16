import { TailAdminButton } from "@/components/ui-tailadmin";
import type { TailAdminButtonProps } from "@/components/ui-tailadmin";

export type AppButtonProps = TailAdminButtonProps;

export function AppButton(props: AppButtonProps) {
  return <TailAdminButton {...props} />;
}

export default AppButton;
