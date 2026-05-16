import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function TailAdminTableContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]",
        className,
      )}
      {...props}
    />
  );
}

export function TailAdminTableScroll({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("max-w-full overflow-x-auto", className)} {...props} />;
}

export function TailAdminTable({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("min-w-full border-collapse", className)} {...props} />;
}

export function TailAdminTableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("border-b border-blue-light-100 bg-blue-light-50 dark:border-gray-800 dark:bg-brand-500/[0.08]", className)}
      {...props}
    />
  );
}

export function TailAdminTableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-gray-100 dark:divide-gray-800", className)}
      {...props}
    />
  );
}

export function TailAdminTableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors duration-150 hover:!bg-brand-25 dark:hover:!bg-white/[0.04]", className)}
      {...props}
    />
  );
}

export function TailAdminTableHead({
  className,
  scope = "col",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        "whitespace-nowrap px-5 py-3 text-left text-theme-xs font-semibold text-gray-900 dark:text-white/90",
        className,
      )}
      {...props}
    />
  );
}

export function TailAdminTableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-5 py-4 text-sm text-gray-700 dark:text-gray-300", className)}
      {...props}
    />
  );
}

export function TailAdminTableCaption({
  className,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("px-5 py-4 text-left text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    />
  );
}
