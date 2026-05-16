import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TailAdminCardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function TailAdminCard({
  className,
  elevated = false,
  ...props
}: TailAdminCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]",
        elevated ? "shadow-theme-md" : "shadow-theme-xs",
        className,
      )}
      {...props}
    />
  );
}

export function TailAdminCardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-5 sm:px-6", className)} {...props} />;
}

export function TailAdminCardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-medium text-gray-800 dark:text-white/90", className)}
      {...props}
    />
  );
}

export function TailAdminCardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  );
}

export function TailAdminCardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-gray-100 p-5 dark:border-gray-800 sm:p-6", className)}
      {...props}
    />
  );
}

export function TailAdminCardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6", className)}
      {...props}
    />
  );
}

export interface TailAdminComponentCardProps
  extends Omit<TailAdminCardProps, "title" | "children"> {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function TailAdminComponentCard({
  title,
  description,
  children,
  footer,
  className,
  ...props
}: TailAdminComponentCardProps) {
  return (
    <TailAdminCard className={className} {...props}>
      <TailAdminCardHeader>
        <TailAdminCardTitle>{title}</TailAdminCardTitle>
        {description ? (
          <TailAdminCardDescription>{description}</TailAdminCardDescription>
        ) : null}
      </TailAdminCardHeader>
      <TailAdminCardContent>{children}</TailAdminCardContent>
      {footer ? <TailAdminCardFooter>{footer}</TailAdminCardFooter> : null}
    </TailAdminCard>
  );
}

export default TailAdminCard;
