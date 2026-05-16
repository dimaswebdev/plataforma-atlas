import { AppModal } from "@/components/ui";
import type { AppModalProps } from "@/components/ui";

export type AdminModalProps = AppModalProps;

export function AdminModal(props: AdminModalProps) {
  return <AppModal {...props} />;
}

export default AdminModal;
