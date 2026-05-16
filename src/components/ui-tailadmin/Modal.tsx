"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type TailAdminModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface TailAdminModalProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: TailAdminModalSize;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeClasses: Record<TailAdminModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "h-full max-w-none rounded-none sm:h-auto sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl",
};

export function TailAdminModal({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  contentClassName,
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
}: TailAdminModalProps) {
  const visible = open ?? isOpen ?? false;
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const requestClose = useCallback(() => {
    onOpenChange?.(false);
    onClose?.();
  }, [onClose, onOpenChange]);

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, requestClose, visible]);

  if (!visible || typeof document === "undefined") return null;

  const isAdminDark = document.documentElement.dataset.adminTheme === "dark";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[2147483647] flex items-center justify-center overflow-y-auto px-4 py-6",
        isAdminDark && "dark",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      <button
        type="button"
        aria-label="Fechar modal"
        className="fixed inset-0 z-0 h-full w-full cursor-default bg-gray-900/45 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? requestClose : undefined}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className={cn(
          "relative z-10 w-full rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-900",
          sizeClasses[size],
          contentClassName,
        )}
      >
        {showCloseButton ? (
          <button
            type="button"
            aria-label="Fechar"
            onClick={requestClose}
            className="absolute right-4 top-4 z-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/10 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        ) : null}

        {title || description ? (
          <div className="px-6 pb-4 pt-6 sm:px-8 sm:pt-7">
            {title ? (
              <h2 id={titleId} className="pr-10 text-lg font-semibold text-gray-900 dark:text-white/90">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className="mt-2 pr-10 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {description}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={cn("px-6 py-5 text-gray-700 dark:text-gray-300 sm:px-8", title || description ? "pt-0" : "pt-8")}>
          {children}
        </div>

        {footer ? (
          <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800 sm:px-8">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export default TailAdminModal;
