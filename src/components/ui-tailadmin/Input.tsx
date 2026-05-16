import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type TailAdminInputSize = "sm" | "md";

export interface TailAdminInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  inputSize?: TailAdminInputSize;
  success?: boolean;
  error?: boolean;
  hint?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeClasses: Record<TailAdminInputSize, string> = {
  sm: "h-10 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function TailAdminInput({
  className,
  inputSize = "md",
  success = false,
  error = false,
  hint,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: TailAdminInputProps) {
  return (
    <div className="relative">
      {leftIcon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-gray-500 dark:text-gray-400">
          {leftIcon}
        </span>
      ) : null}
      <input
        disabled={disabled}
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cn(
          "w-full appearance-none rounded-lg border bg-transparent shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 dark:disabled:bg-gray-800",
          sizeClasses[inputSize],
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error
            ? "border-error-500 text-error-800 focus:border-error-500 focus:ring-error-500/10 dark:text-error-400"
            : success
              ? "border-success-500 text-success-700 focus:border-success-500 focus:ring-success-500/10 dark:text-success-400"
              : "border-gray-300 text-gray-800 dark:border-gray-700",
          className,
        )}
        {...props}
      />
      {rightIcon ? (
        <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-gray-500 dark:text-gray-400">
          {rightIcon}
        </span>
      ) : null}
      {hint ? (
        <p
          className={cn(
            "mt-1.5 text-xs leading-5",
            error
              ? "text-error-500"
              : success
                ? "text-success-600"
                : "text-gray-500 dark:text-gray-400",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TailAdminLabel({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400", className)}
      {...props}
    />
  );
}

export default TailAdminInput;
