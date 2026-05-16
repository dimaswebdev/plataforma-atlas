import { TailAdminModal } from "@/components/ui-tailadmin";
import type { TailAdminModalProps } from "@/components/ui-tailadmin";

export type AppModalProps = TailAdminModalProps;

export function AppModal(props: AppModalProps) {
  return <TailAdminModal {...props} />;
}

export default AppModal;
