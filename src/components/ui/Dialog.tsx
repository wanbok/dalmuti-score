"use client";

import { useEffect, useRef, useId } from "react";
import { Button } from "./Button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      aria-labelledby={titleId}
      className="rounded-2xl p-0 m-auto bg-surface-elevated backdrop:bg-backdrop max-w-sm w-[calc(100%-2rem)] shadow-xl border border-border focus:outline-none"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-lg font-bold text-text-primary mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-2">
          {actions ?? (
            <Button variant="secondary" onClick={onClose}>
              닫기
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
