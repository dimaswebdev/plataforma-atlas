import type {
  CSSProperties,
  ComponentProps,
  ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Loader2,
  Search,
} from "lucide-react";
import {
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableContainer,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
  AppTableScroll,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";
import { AdminTableToolbar } from "./AdminTableToolbar";

type SortDirection = "asc" | "desc" | null;

interface AdminTableToolbarConfig {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  pageSizeValue?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (value: number) => void;
  filters?: ReactNode;
  exportAction?: ReactNode;
  primaryAction?: ReactNode;
}

interface AdminTableFooterConfig {
  totalCount?: number;
  displayedCount?: number;
  page?: number;
  pageCount?: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  label?: ReactNode;
}

interface AdminDataTableProps {
  columns: ReactNode;
  children?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  toolbar?: ReactNode;
  toolbarConfig?: AdminTableToolbarConfig;
  pagination?: ReactNode;
  footer?: ReactNode;
  footerConfig?: AdminTableFooterConfig;
  loading?: boolean;
  loadingLabel?: string;
  empty?: boolean;
  emptyLabel?: ReactNode;
  colSpan: number;
  minWidth?: number | string;
  colgroup?: ReactNode;
  className?: string;
  headerClassName?: string;
  tableClassName?: string;
  bodyClassName?: string;
  sectionClassName?: string;
}

interface AdminTableHeadProps extends ComponentProps<typeof AppTableHead> {
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

function getMinWidthStyle(minWidth?: number | string): CSSProperties | undefined {
  if (!minWidth) return undefined;
  return { minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth };
}

function formatTableCount(count?: number) {
  if (typeof count !== "number") return "0";
  return new Intl.NumberFormat("pt-BR").format(count);
}

function renderDefaultFooter(config?: AdminTableFooterConfig) {
  if (!config) return null;

  const {
    totalCount,
    displayedCount,
    page = 1,
    pageCount = 1,
    onPreviousPage,
    onNextPage,
    previousDisabled,
    nextDisabled,
    label,
  } = config;

  const hasCount = typeof totalCount === "number" || typeof displayedCount === "number";
  const safeDisplayed = displayedCount ?? totalCount ?? 0;
  const safeTotal = totalCount ?? displayedCount ?? 0;

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {label ?? (hasCount ? (
          <>
            Exibindo{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatTableCount(safeDisplayed)}
            </span>{" "}
            de{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatTableCount(safeTotal)}
            </span>{" "}
            registros
          </>
        ) : (
          "Registros administrativos"
        ))}
      </p>

      <div className="flex items-center gap-2">
        <AdminButton
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={previousDisabled ?? (!onPreviousPage || page <= 1)}
          startIcon={<ChevronLeft className="h-4 w-4" aria-hidden="true" />}
        >
          Anterior
        </AdminButton>
        <span className="min-w-16 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {page}/{pageCount}
        </span>
        <AdminButton
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={nextDisabled ?? (!onNextPage || page >= pageCount)}
          endIcon={<ChevronRight className="h-4 w-4" aria-hidden="true" />}
        >
          Próximo
        </AdminButton>
      </div>
    </div>
  );
}

function renderToolbar(config?: AdminTableToolbarConfig) {
  if (!config) return null;

  const {
    searchValue,
    searchPlaceholder = "Buscar registros...",
    onSearchChange,
    pageSizeValue,
    pageSizeOptions = [10, 25, 50, 100],
    onPageSizeChange,
    filters,
    exportAction,
    primaryAction,
  } = config;

  const hasSearch = typeof searchValue === "string" || Boolean(onSearchChange);
  const hasPageSize = typeof pageSizeValue === "number" || Boolean(onPageSizeChange);

  return (
    <AdminTableToolbar
      left={
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          {hasPageSize ? (
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Mostrar</span>
              <select
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                value={pageSizeValue}
                onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
                disabled={!onPageSizeChange}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span>registros</span>
            </label>
          ) : null}

          {hasSearch ? (
            <label className="relative block w-full min-w-0 sm:w-72">
              <span className="sr-only">Buscar</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                value={searchValue ?? ""}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-700 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                disabled={!onSearchChange}
              />
            </label>
          ) : null}
        </div>
      }
      right={
        <>
          {filters}
          {exportAction}
          {primaryAction}
        </>
      }
    />
  );
}

export function AdminDataTable({
  columns,
  children,
  title,
  description,
  actions,
  toolbar,
  toolbarConfig,
  pagination,
  footer,
  footerConfig,
  loading = false,
  loadingLabel = "Carregando registros...",
  empty = false,
  emptyLabel = "Nenhum registro encontrado.",
  colSpan,
  minWidth,
  colgroup,
  className,
  headerClassName,
  tableClassName,
  bodyClassName,
  sectionClassName,
}: AdminDataTableProps) {
  const resolvedToolbar = toolbar ?? renderToolbar(toolbarConfig);
  const resolvedFooter = footer ?? pagination ?? renderDefaultFooter(footerConfig);

  return (
    <section className={cn("min-w-0", sectionClassName)}>
      {(title || description || actions) ? (
        <div
          className={cn(
            "mb-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
            headerClassName,
          )}
        >
          <div className="min-w-0">
            {title ? (
              <h2 className="tailadmin-title text-base font-semibold text-gray-900 dark:text-white/90">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      <AppTableContainer
        className={cn(
          "border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03]",
          className,
        )}
      >
        {resolvedToolbar}
        <AppTableScroll className="custom-scrollbar">
          <AppTable
            className={cn("w-full", tableClassName)}
            style={getMinWidthStyle(minWidth)}
          >
            {colgroup}
            <AppTableHeader>
              <AppTableRow className="hover:bg-transparent dark:hover:bg-transparent">
                {columns}
              </AppTableRow>
            </AppTableHeader>
            <AppTableBody className={cn("divide-y divide-gray-100 dark:divide-gray-800", bodyClassName)}>
              {loading ? (
                <AppTableRow>
                  <AppTableCell colSpan={colSpan} className="py-10 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-500" aria-hidden="true" />
                      <span>{loadingLabel}</span>
                    </div>
                  </AppTableCell>
                </AppTableRow>
              ) : empty ? (
                <AppTableRow>
                  <AppTableCell colSpan={colSpan} className="py-10 text-center text-gray-500 dark:text-gray-400">
                    {emptyLabel}
                  </AppTableCell>
                </AppTableRow>
              ) : (
                children
              )}
            </AppTableBody>
          </AppTable>
        </AppTableScroll>
        {resolvedFooter ? (
          <div className="border-t border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-transparent">
            {resolvedFooter}
          </div>
        ) : null}
      </AppTableContainer>
    </section>
  );
}

export function AdminTableHead({
  children,
  className,
  sortable = false,
  sortDirection = null,
  onSort,
  ...props
}: AdminTableHeadProps) {
  const SortIcon = sortDirection === "asc"
    ? ChevronUp
    : sortDirection === "desc"
      ? ChevronDown
      : ChevronsUpDown;

  if (!sortable) {
    return (
      <AppTableHead className={className} {...props}>
        {children}
      </AppTableHead>
    );
  }

  return (
    <AppTableHead className={className} {...props}>
      <button
        type="button"
        onClick={onSort}
        disabled={!onSort}
        className="inline-flex items-center gap-1.5 rounded-md text-left font-semibold text-gray-900 transition hover:text-brand-600 disabled:cursor-default disabled:hover:text-gray-900 dark:text-white/90 dark:hover:text-brand-400"
      >
        <span>{children}</span>
        <SortIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
      </button>
    </AppTableHead>
  );
}

export const AdminTableRow = AppTableRow;
export const AdminTableCell = AppTableCell;

export default AdminDataTable;
