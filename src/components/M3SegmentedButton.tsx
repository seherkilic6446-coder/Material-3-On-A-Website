import React from "react";
import { Check } from "lucide-react";

export interface M3SegmentOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface M3SegmentedButtonProps {
  options: M3SegmentOption[];
  selectedValue: string | string[]; // Single string for single select, array for multi-select
  onChange: (value: string) => void; // Emits the clicked option value, parent updates state
  multiSelect?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  variant?: "standard" | "modern";
}

export const M3SegmentedButton: React.FC<M3SegmentedButtonProps> = ({
  options,
  selectedValue,
  onChange,
  multiSelect = false,
  disabled = false,
  className = "",
  id,
  variant = "modern",
}) => {
  const isSelected = (val: string): boolean => {
    if (multiSelect && Array.isArray(selectedValue)) {
      return selectedValue.includes(val);
    }
    return selectedValue === val;
  };

  // Modern style matches the uploaded reference image:
  // - Discrete capsule pill buttons with very tight gaps
  // - Filled light container for unselected segments (light lavender/M3 secondary container)
  // - Darker solid background for the selected active segment (M3 primary)
  if (variant === "modern") {
    return (
      <div
        id={id}
        className={`inline-flex p-1 bg-[var(--m3-surface-container-high)] rounded-full gap-1 w-full md:w-auto items-center ${
          disabled ? "opacity-50 pointer-events-none" : ""
        } ${className}`}
      >
        {options.map((option) => {
          const active = isSelected(option.value);

          let btnClasses = `
            flex-1 md:flex-none md:px-5 h-10 rounded-full inline-flex items-center justify-center gap-1.5 text-sm font-bold transition-all duration-150 select-none outline-none focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-1 relative overflow-hidden
          `;

          if (active) {
            btnClasses += " bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm hover:brightness-105 active:scale-[0.98]";
          } else {
            btnClasses += " bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] hover:bg-[var(--m3-secondary-container)] hover:brightness-[0.97] active:brightness-90 active:scale-[0.98]";
          }

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={btnClasses}
            >
              {active && <Check className="h-4 w-4 stroke-[3]" />}
              {option.icon && !active && <span className="flex items-center">{option.icon}</span>}
              <span>{option.label}</span>
              
              {/* Tactile state layer */}
              <span className="absolute inset-0 bg-white opacity-0 hover:opacity-[0.06] active:opacity-[0.12] transition-opacity pointer-events-none" />
            </button>
          );
        })}
      </div>
    );
  }

  // Classic M3 Outlined Segmented Button style:
  // - Track height: 40px (h-10)
  // - Outlined: border border-outline, rounded-full
  // - Active segment: secondaryContainer background, onSecondaryContainer text
  return (
    <div
      id={id}
      className={`inline-flex h-10 w-full md:w-auto rounded-full overflow-hidden border border-[var(--m3-outline)] ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
    >
      {options.map((option, index) => {
        const active = isSelected(option.value);
        const hasLeftBorder = index > 0;

        let btnClasses = `
          flex-1 md:flex-none md:px-5 h-full inline-flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 select-none outline-none focus:bg-black focus:bg-opacity-[0.04]
        `;

        if (active) {
          btnClasses += " bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)]";
        } else {
          btnClasses += " bg-transparent text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-on-surface-variant)] hover:bg-opacity-[0.08] active:bg-opacity-[0.12]";
        }

        // Add separator border
        const borderClasses = hasLeftBorder ? "border-l border-[var(--m3-outline)]" : "";

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`${btnClasses} ${borderClasses}`}
          >
            {active && <Check className="h-4 w-4 stroke-[3]" />}
            {option.icon && !active && <span className="flex items-center">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
