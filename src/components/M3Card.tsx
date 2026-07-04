import React from "react";
import { motion } from "motion/react";

export type M3CardVariant = "elevated" | "filled" | "outlined";

interface M3CardProps {
  variant?: M3CardVariant;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

export const M3Card: React.FC<M3CardProps> = ({
  variant = "elevated",
  onClick,
  className = "",
  children,
  id,
}) => {
  const isClickable = !!onClick;

  // M3 Card specifications:
  // - Rounded corners: 28px (Extra Large)
  // - Elevated: bg-surface, shadow-sm (elevation 1), hover shadow-md (elevation 2)
  // - Filled: bg-surfaceVariant, no shadow
  // - Outlined: bg-surface, border border-outlineVariant, no shadow

  let baseStyles = "rounded-[28px] overflow-hidden p-6 transition-all duration-200 relative";
  let variantStyles = "";

  if (isClickable) {
    baseStyles += " cursor-pointer select-none outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2";
  }

  switch (variant) {
    case "elevated":
      variantStyles = `
        bg-[var(--m3-surface)] text-[var(--m3-on-surface)]
        shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]
        dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]
        ${isClickable ? "hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:bg-[var(--m3-primary)] hover:bg-opacity-[0.02]" : ""}
      `;
      break;
    case "filled":
      variantStyles = `
        bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface-variant)]
        ${isClickable ? "hover:brightness-[1.02] active:brightness-95 hover:shadow-sm" : ""}
      `;
      break;
    case "outlined":
      variantStyles = `
        bg-[var(--m3-surface)] text-[var(--m3-on-surface)]
        border border-[var(--m3-outline-variant)]
        ${isClickable ? "hover:bg-[var(--m3-primary)] hover:bg-opacity-[0.04] active:bg-opacity-[0.08]" : ""}
      `;
      break;
  }

  return (
    <motion.div
      id={id}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {/* State layer overlay */}
      {isClickable && (
        <div className="absolute inset-0 bg-transparent hover:bg-current hover:opacity-[0.04] active:opacity-[0.1] transition-opacity pointer-events-none rounded-[28px]" />
      )}
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </motion.div>
  );
};
