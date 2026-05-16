"use client";

import { AlertTriangle } from "lucide-react";
import { AdminButton } from "./AdminButton";
import { AdminModal } from "./AdminModal";

interface AdminConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  error,
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      size="sm"
      closeOnEscape={!loading}
      closeOnOverlayClick={!loading}
      showCloseButton={!loading}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AdminButton
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            type="button"
            variant="primary"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${destructive ? "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500" : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"}`}>
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
            Confirme a ação para continuar.
          </p>
          {error ? (
            <div className="mt-4 rounded-lg border border-error-200 bg-error-50 p-3 text-sm leading-relaxed text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-500">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </AdminModal>
  );
}

