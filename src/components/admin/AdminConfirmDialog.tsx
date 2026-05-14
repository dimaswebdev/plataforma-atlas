"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X } from "lucide-react";

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
  if (!open || typeof document === "undefined") return null;

  const modal = (
    <div className="atlas-admin-modal fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description"
        className="atlas-modal-panel w-full max-w-md overflow-hidden rounded-lg border border-atlas-navy-aero/35 bg-atlas-navy-deep shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`mt-0.5 rounded-lg border p-2 ${destructive ? "border-red-400/30 bg-red-500/10 text-red-300" : "border-atlas-gold-main/30 bg-atlas-gold-main/10 text-atlas-gold-main"}`}>
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="admin-confirm-title" className="atlas-section-title text-white">
                {title}
              </h2>
              <p id="admin-confirm-description" className="mt-2 text-sm leading-relaxed text-atlas-text-muted">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-atlas-text-muted transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar confirmação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-5 rounded-lg border border-red-400/35 bg-red-500/10 p-3 text-sm leading-relaxed text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="atlas-muted-button"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`atlas-primary-button ${destructive ? "atlas-danger-button bg-red-500 text-white hover:bg-red-600" : ""}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
