import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";

interface M3SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  showIcons?: boolean;
  customIcons?: {
    checked?: React.ReactNode;
    unchecked?: React.ReactNode;
  };
  id?: string;
}

export const M3Switch: React.FC<M3SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  showIcons = false,
  customIcons,
  id,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // M3 Switch sizing:
  // Track: 52px wide, 32px high
  // Thumb: 16px (unselected, no icon), 24px (selected or with icon)

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  // Track colors
  const trackBg = disabled
    ? "bg-neutral-200 dark:bg-neutral-800 opacity-30"
    : checked
    ? "bg-[var(--m3-primary)]"
    : "bg-[var(--m3-surface-variant)] border-2 border-[var(--m3-outline)]";

  // Thumb colors
  const thumbBg = disabled
    ? "bg-neutral-400 dark:bg-neutral-600"
    : checked
    ? "bg-[var(--m3-on-primary)]"
    : "bg-[var(--m3-outline)]";

  // Icon colors
  const iconColor = checked
    ? "text-[var(--m3-primary)]"
    : "text-[var(--m3-surface-variant)]";

  // Thumb size calculation
  // In M3: 
  // - Checked + Icon = 24px
  // - Checked + No Icon = 24px
  // - Unchecked + Icon = 24px
  // - Unchecked + No Icon = 16px
  const hasIcon = showIcons || !!customIcons;
  const thumbSize = checked || hasIcon ? "h-6 w-6" : "h-4 w-4";

  // Thumb movement translation (inside 52px track with some padding)
  // Track width is 52px. 
  // With 2px padding:
  // - If checked (thumb size 24px): left: 24px (52 - 24 - 4 = 24px)
  // - If unchecked and hasIcon (thumb size 24px): left: 4px
  // - If unchecked and noIcon (thumb size 16px): left: 8px (to center 16px inside 32px height, actually padding is larger)
  const thumbX = checked 
    ? 20 // 52px track - 24px thumb - 8px margin 
    : 0;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onMouseLeave={() => !disabled && setIsPressed(false)}
      onClick={handleToggle}
      className={`
        relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2
        ${trackBg}
        ${disabled ? "cursor-not-allowed" : ""}
      `}
    >
      <motion.div
        animate={{
          x: checked ? 22 : 4,
          scale: isPressed ? 1.15 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`
          flex items-center justify-center rounded-full transition-all duration-200
          ${thumbBg}
          ${thumbSize}
          shadow-sm
        `}
      >
        {/* Thumb Icon */}
        {hasIcon && (
          <span className={`text-[10px] font-bold ${iconColor}`}>
            {checked ? (
              customIcons?.checked || <Check className="h-4 w-4 stroke-[3]" />
            ) : (
              customIcons?.unchecked || <X className="h-4 w-4 stroke-[3]" />
            )}
          </span>
        )}
      </motion.div>
    </button>
  );
};
