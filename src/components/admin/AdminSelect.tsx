import { AppSelect } from "@/components/ui";
import type { AppSelectProps } from "@/components/ui";

export type AdminSelectProps = AppSelectProps;

export function AdminSelect(props: AdminSelectProps) {
  return <AppSelect {...props} />;
}

export default AdminSelect;
