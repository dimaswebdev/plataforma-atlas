import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AdminMetricGridColumns = 2 | 3 | 4 | 5 | 6;

interface AdminMetricGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: AdminMetricGridColumns;
}

const columnClasses: Record<AdminMetricGridColumns, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  5: "sm:grid-cols-2 xl:grid-cols-5",
  6: "sm:grid-cols-2 xl:grid-cols-6",
};

export function AdminMetricGrid({
  columns = 4,
  className,
  ...props
}: AdminMetricGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 md:gap-5", columnClasses[columns], className)}
      {...props}
    />
  );
}

export default AdminMetricGrid;
