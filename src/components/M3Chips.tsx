import React from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";

export type M3ChipVariant = "assist" | "filter" | "input" | "suggestion";

interface M3ChipProps {
  label: string;
  variant?: M3ChipVariant;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const M3Chip: React.FC<M3ChipProps> = ({
  label,
  variant = "suggestion",
  selected = false,
  onClick,
  onRemove,
  icon,
  disabled = false,
  className = "",
  id,
}) => {
  const isClickable = !!onClick && !disabled;

  // M3 Chip Style Guidelines:
  // - Rounded corners: 8px (Small)
  // - Height: 32px (h-8)
  // - Outline: border border-outline or outlineVariant
  // - Selected background: secondaryContainer or primaryContainer
  // - Selected text: onSecondaryContainer or onPrimaryContainer

  let baseStyles = "inline-flex items-center justify-center gap-2 h-8 px-3 rounded-[8px] text-sm font-medium transition-all duration-200 select-none outline-none ";
  let variantStyles = "";

  if (disabled) {
    baseStyles += "bg-transparent border border-neutral-200 dark:border-neutral-800 text-neutral-400 cursor-not-allowed opacity-50";
  } else {
    // Interactive states
    if (isClickable) {
      baseStyles += "cursor-pointer focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-1 ";
    }

    if (selected) {
      variantStyles = `
        bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] border-none
        shadow-sm hover:brightness-105 active:brightness-95
      `;
    } else {
      variantStyles = `
        bg-transparent border border-[var(--m3-outline)] text-[var(--m3-on-surface-variant)]
        hover:bg-[var(--m3-on-surface-variant)] hover:bg-opacity-[0.08] active:bg-opacity-[0.12]
      `;
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove();
    }
  };

  return (
    <motion.div
      id={id}
      whileTap={isClickable ? { scale: 0.97 } : {}}
      onClick={() => isClickable && onClick && onClick()}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {/* Leading Checkmark for selected filter chip */}
      {variant === "filter" && selected && (
        <Check className="h-3.5 w-3.5 text-[var(--m3-on-secondary-container)] stroke-[3]" />
      )}

      {/* Custom Leading Icon */}
      {icon && !selected && <span className="flex items-center text-sm">{icon}</span>}

      <span>{label}</span>

      {/* Trailing Remove Button for Input chips */}
      {variant === "input" && onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className="rounded-full p-0.5 -mr-1 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-colors focus:outline-none"
        >
          <X className="h-3.5 w-3.5 stroke-[2]" />
        </button>
      )}
    </motion.div>
  );
};
