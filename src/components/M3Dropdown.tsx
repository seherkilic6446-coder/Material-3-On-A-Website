import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface M3DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface M3DropdownProps {
  label: string;
  options: M3DropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  variant?: "outlined" | "filled";
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  id?: string;
  helperText?: string;
}

export const M3Dropdown: React.FC<M3DropdownProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  variant = "outlined",
  disabled = false,
  leadingIcon,
  id,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
  };

  const isFloating = isOpen || !!selectedValue;

  let containerClasses = `relative w-full h-14 flex items-center justify-between cursor-pointer transition-all duration-200 px-4 rounded-[4px]
    ${disabled ? "cursor-not-allowed opacity-50 bg-neutral-100 dark:bg-neutral-800" : ""}`;

  let labelClasses = "absolute transition-all duration-200 pointer-events-none select-none left-4 ";

  if (variant === "outlined") {
    containerClasses += ` border 
      ${disabled
        ? "border-neutral-200 dark:border-neutral-800"
        : isOpen
        ? "border-2 border-[var(--m3-primary)] bg-transparent"
        : "border-[var(--m3-outline)] hover:border-[var(--m3-on-surface-variant)] bg-transparent"
      }`;

    if (isFloating) {
      labelClasses += ` -top-2.5 text-xs px-1 bg-[var(--m3-background)] z-10
        ${isOpen ? "text-[var(--m3-primary)] font-medium" : "text-[var(--m3-on-surface-variant)]"}`;
    } else {
      labelClasses += ` text-base top-4 text-[var(--m3-on-surface-variant)] ${leadingIcon ? "pl-8" : ""}`;
    }
  } else {
    // FILLED VARIANT
    containerClasses += ` rounded-t-[4px] bg-[var(--m3-surface-variant)] border-b
      ${disabled
        ? "border-neutral-300 dark:border-neutral-700"
        : isOpen
        ? "border-b-2 border-[var(--m3-primary)] bg-opacity-90"
        : "border-[var(--m3-on-surface-variant)] border-opacity-40 hover:bg-opacity-95"
      }`;

    if (isFloating) {
      labelClasses += ` top-1.5 text-xs
        ${isOpen ? "text-[var(--m3-primary)] font-medium" : "text-[var(--m3-on-surface-variant)]"}`;
    } else {
      labelClasses += ` text-base top-4 text-[var(--m3-on-surface-variant)] ${leadingIcon ? "pl-8" : ""}`;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-1" id={id}>
      <div onClick={handleToggle} className={containerClasses}>
        <div className="flex items-center gap-3 w-full pr-4">
          {/* Leading Icon */}
          {leadingIcon && (
            <div className="text-[var(--m3-on-surface-variant)] shrink-0">
              {leadingIcon}
            </div>
          )}

          {/* Label */}
          <span className={labelClasses}>{label}</span>

          {/* Selected Option Content */}
          {selectedValue && (
            <div className={`flex items-center gap-2 ${variant === "filled" && isFloating ? "pt-5 text-sm" : "text-base"}`}>
              {selectedOption?.icon && (
                <span className="text-[var(--m3-primary)] shrink-0">{selectedOption.icon}</span>
              )}
              <span className="text-[var(--m3-on-surface)] truncate">{selectedOption?.label}</span>
            </div>
          )}
        </div>

        {/* Arrow Toggle */}
        <div className="text-[var(--m3-on-surface-variant)] shrink-0">
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[var(--m3-primary)]" : ""
            }`}
          />
        </div>
      </div>

      {/* Helper Text */}
      {helperText && !isOpen && (
        <span className="text-[11px] text-[var(--m3-on-surface-variant)] px-4 leading-normal">
          {helperText}
        </span>
      )}

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-[16px] border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-high)] shadow-[0_4px_12px_rgba(0,0,0,0.15)] max-h-60 overflow-y-auto"
          >
            <div className="p-1">
              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-[12px] text-left transition-colors duration-150
                      ${
                        isSelected
                          ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] font-semibold"
                          : "text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-variant)] hover:text-[var(--m3-on-surface-variant)]"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <span className={isSelected ? "text-[var(--m3-on-primary-container)]" : "text-[var(--m3-primary)]"}>
                          {option.icon}
                        </span>
                      )}
                      <span>{option.label}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
