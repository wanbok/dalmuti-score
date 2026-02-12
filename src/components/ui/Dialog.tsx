"use client";

import { useEffect, useRef } from "react";
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
      className="rounded-xl p-0 backdrop:bg-black/50 max-w-sm w-full"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
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
