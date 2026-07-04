import React, { useState } from "react";
import { motion } from "motion/react";

interface M3RadioProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const M3Radio: React.FC<M3RadioProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!disabled && !checked) {
      onChange();
    }
  };

  const ringBg = disabled
    ? checked
      ? "border-neutral-400 dark:border-neutral-600"
      : "border-neutral-300 dark:border-neutral-700"
    : checked
    ? "border-[var(--m3-primary)]"
    : "border-[var(--m3-outline)] hover:border-[var(--m3-on-surface)]";

  const dotBg = disabled
    ? "bg-neutral-400 dark:bg-neutral-600"
    : "bg-[var(--m3-primary)]";

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
        handleClick();
      }}
    >
      <div className="relative h-10 w-10 flex items-center justify-center rounded-full">
        {/* Hover / Press State Layer */}
        <motion.div
          animate={{
            scale: isPressed ? 1 : isHovered ? 0.9 : 0,
            opacity: isPressed ? 0.16 : isHovered ? 0.08 : 0,
          }}
          className="absolute inset-0 rounded-full bg-[var(--m3-primary)] pointer-events-none"
        />

        {/* Outer Circle Ring */}
        <div
          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${ringBg}`}
        >
          {/* Inner Selected Dot */}
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`h-2.5 w-2.5 rounded-full ${dotBg}`}
            />
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
