import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { M3Button } from "./M3Button";

interface M3DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  supportingText: string;
  icon?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  id?: string;
}

export const M3Dialog: React.FC<M3DialogProps> = ({
  isOpen,
  onClose,
  title,
  supportingText,
  icon,
  confirmLabel = "OK",
  onConfirm,
  cancelLabel = "Cancel",
  id,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900 bg-opacity-40 backdrop-blur-[1px]"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] bg-[var(--m3-surface)] p-6 text-[var(--m3-on-surface)] shadow-[0_24px_38px_3px_rgba(0,0,0,0.14),0_9px_46px_8px_rgba(0,0,0,0.12),0_11px_15px_-7px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_38px_rgba(0,0,0,0.6)]"
          >
            <div className="flex flex-col items-center text-center">
              {/* Optional Header Icon */}
              {icon && (
                <div className="mb-4 flex h-8 w-8 items-center justify-center text-[var(--m3-secondary)]">
                  {icon}
                </div>
              )}

              {/* Title */}
              <h3 className={`w-full text-xl font-medium tracking-tight text-[var(--m3-on-surface)] ${icon ? "text-center" : "text-left mb-2"}`}>
                {title}
              </h3>

              {/* Supporting Text */}
              <p className="mt-2 text-sm text-[var(--m3-on-surface-variant)] leading-relaxed text-left w-full">
                {supportingText}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex justify-end gap-2">
              {cancelLabel && (
                <M3Button variant="text" onClick={onClose}>
                  {cancelLabel}
                </M3Button>
              )}
              <M3Button
                variant="text"
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
              >
                {confirmLabel}
              </M3Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
