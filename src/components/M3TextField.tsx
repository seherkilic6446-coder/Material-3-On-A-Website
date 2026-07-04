import React, { useState } from "react";

export type M3TextFieldVariant = "outlined" | "filled";

interface M3TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  variant?: M3TextFieldVariant;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  id?: string;
}

export const M3TextField: React.FC<M3TextFieldProps> = ({
  label,
  value,
  onChange,
  variant = "outlined",
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  disabled = false,
  className = "",
  id,
  type = "text",
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const isFloating = isFocused || value.length > 0;
  const hasError = !!error;

  // Colors based on M3 specs:
  // Focus color: primary
  // Error color: error
  // Standard color: outline (outlined) / surfaceVariant (filled)
  let containerClasses = "relative w-full flex items-center transition-all duration-200 ";
  let labelClasses = "absolute transition-all duration-200 pointer-events-none select-none ";
  let inputClasses = "w-full h-14 bg-transparent outline-none text-base text-[var(--m3-on-surface)] transition-all px-4 ";

  if (leadingIcon) {
    inputClasses += "pl-12 ";
  }
  if (trailingIcon) {
    inputClasses += "pr-12 ";
  }

  // Handle styles depending on variant
  if (variant === "outlined") {
    containerClasses += `
      rounded-[4px] border
      ${disabled 
        ? "border-neutral-200 dark:border-neutral-800 cursor-not-allowed opacity-50" 
        : hasError 
        ? "border-[var(--m3-error)] hover:border-[var(--m3-error)] focus-within:border-[var(--m3-error)]" 
        : isFocused 
        ? "border-2 border-[var(--m3-primary)]" 
        : "border-[var(--m3-outline)] hover:border-[var(--m3-on-surface-variant)]"
      }
    `;

    // Label position
    if (isFloating) {
      labelClasses += `
        -top-2.5 text-xs px-1 bg-[var(--m3-background)] z-10
        ${leadingIcon ? "left-4" : "left-3"}
        ${disabled 
          ? "text-neutral-400" 
          : hasError 
          ? "text-[var(--m3-error)]" 
          : isFocused 
          ? "text-[var(--m3-primary)] font-medium" 
          : "text-[var(--m3-on-surface-variant)]"
        }
      `;
    } else {
      labelClasses += `
        top-4 text-base
        ${leadingIcon ? "left-12" : "left-4"}
        ${disabled ? "text-neutral-400" : "text-[var(--m3-on-surface-variant)]"}
      `;
    }
  } else {
    // FILLED VARIANT
    containerClasses += `
      rounded-t-[4px] bg-[var(--m3-surface-variant)] border-b
      ${disabled 
        ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 cursor-not-allowed opacity-50" 
        : hasError 
        ? "border-[var(--m3-error)] bg-opacity-95" 
        : isFocused 
        ? "border-b-2 border-[var(--m3-primary)] bg-opacity-90" 
        : "border-[var(--m3-on-surface-variant)] border-opacity-40 hover:bg-opacity-95"
      }
    `;

    // Label position
    if (isFloating) {
      labelClasses += `
        top-1.5 text-xs
        ${leadingIcon ? "left-12" : "left-4"}
        ${disabled 
          ? "text-neutral-400" 
          : hasError 
          ? "text-[var(--m3-error)]" 
          : isFocused 
          ? "text-[var(--m3-primary)] font-medium" 
          : "text-[var(--m3-on-surface-variant)]"
        }
      `;
      // Push text down to make space for top floating label
      inputClasses += "pt-5 pb-1 ";
    } else {
      labelClasses += `
        top-4 text-base
        ${leadingIcon ? "left-12" : "left-4"}
        ${disabled ? "text-neutral-400" : "text-[var(--m3-on-surface-variant)]"}
      `;
    }
  }

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {/* Input container */}
      <div className={containerClasses}>
        {/* Leading Icon */}
        {leadingIcon && (
          <div className="absolute left-4 flex items-center justify-center text-[var(--m3-on-surface-variant)] pointer-events-none">
            {leadingIcon}
          </div>
        )}

        {/* Dynamic floating label */}
        <span className={labelClasses}>{label}</span>

        {/* Real input */}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => !disabled && onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />

        {/* Trailing Icon */}
        {trailingIcon && (
          <div className="absolute right-4 flex items-center justify-center text-[var(--m3-on-surface-variant)] pointer-events-none">
            {trailingIcon}
          </div>
        )}
      </div>

      {/* Helper text / Error text */}
      {(hasError || helperText) && (
        <span
          className={`text-xs px-4 transition-all duration-200 ${
            disabled
              ? "text-neutral-400 dark:text-neutral-600"
              : hasError
              ? "text-[var(--m3-error)] font-medium"
              : "text-[var(--m3-on-surface-variant)]"
          }`}
        >
          {error || helperText}
        </span>
      )}
    </div>
  );
};
