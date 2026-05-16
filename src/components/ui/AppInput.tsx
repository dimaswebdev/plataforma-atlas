import type { ReactNode } from "react";
import { TailAdminInput, TailAdminLabel } from "@/components/ui-tailadmin";
import type { TailAdminInputProps } from "@/components/ui-tailadmin";
import { cn } from "@/lib/utils";

export type AppInputProps = TailAdminInputProps;

interface AppFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function AppInput(props: AppInputProps) {
  return <TailAdminInput {...props} />;
}

export function AppLabel(props: React.ComponentProps<typeof TailAdminLabel>) {
  return <TailAdminLabel {...props} />;
}

export function AppField({
  label,
  htmlFor,
  children,
  className,
}: AppFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      {label ? <AppLabel htmlFor={htmlFor}>{label}</AppLabel> : null}
      {children}
    </div>
  );
}

export default AppInput;
