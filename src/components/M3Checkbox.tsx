import React, { useState } from "react";
import { Check, Minus } from "lucide-react";
import { motion } from "motion/react";

interface M3CheckboxProps {
  checked: boolean | "indeterminate";
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const M3Checkbox: React.FC<M3CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    if (!disabled) {
      onChange(checked === "indeterminate" ? true : !checked);
    }
  };

  const isChecked = checked === true || checked === "indeterminate";

  // Outline / Fill style
  const boxBg = disabled
    ? isChecked
      ? "bg-neutral-300 dark:bg-neutral-700 border-transparent"
      : "bg-transparent border-neutral-300 dark:border-neutral-700"
    : isChecked
    ? "bg-[var(--m3-primary)] border-transparent"
    : "bg-transparent border-2 border-[var(--m3-outline)] hover:border-[var(--m3-on-surface)]";

  return (
    <label
      id={id}
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => !disabled && setIsPressed(false)}
      onClick={(e) => {
        e.preventDefault();
        handleToggle();
      }}
    >
      <div className="relative h-10 w-10 flex items-center justify-center rounded-full">
        {/* State layer overlay (M3 Specs) */}
        <motion.div
          animate={{
            scale: isPressed ? 1 : isHovered ? 0.9 : 0,
            opacity: isPressed ? 0.16 : isHovered ? 0.08 : 0,
          }}
          className="absolute inset-0 rounded-full bg-[var(--m3-primary)] pointer-events-none"
        />

        {/* Checkbox box */}
        <div
          className={`h-[18px] w-[18px] rounded-[4px] flex items-center justify-center transition-all duration-150 ${boxBg}`}
        >
          {checked === true && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[var(--m3-on-primary)]"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </motion.span>
          )}
          {checked === "indeterminate" && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[var(--m3-on-primary)]"
            >
              <Minus className="h-3.5 w-3.5 stroke-[4]" />
            </motion.span>
          )}
        </div>
      </div>

      {label && (
        <span className="text-sm font-medium text-[var(--m3-on-surface)]">
          {label}
        </span>
      )}
    </label>
  );
};
