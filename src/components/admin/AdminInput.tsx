import {
  AppField,
  AppInput,
  AppLabel,
} from "@/components/ui";
import type { AppInputProps } from "@/components/ui";

export type AdminInputProps = AppInputProps;

export function AdminInput(props: AdminInputProps) {
  return <AppInput {...props} />;
}

export const AdminField = AppField;
export const AdminLabel = AppLabel;

export default AdminInput;
