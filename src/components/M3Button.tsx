import React from "react";
import { motion } from "motion/react";

export type M3ButtonVariant =
  | "filled"
  | "tonal"
  | "elevated"
  | "outlined"
  | "text"
  | "fab"
  | "extendedFab";

interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3ButtonVariant;
  icon?: React.ReactNode;
  id?: string;
}

export const M3Button: React.FC<M3ButtonProps> = ({
  variant = "filled",
  icon,
  children,
  className = "",
  disabled = false,
  id,
  ...props
}) => {
  // Styles based on Material 3 specs:
  // - Filled: bg-primary, text-onPrimary
  // - Tonal: bg-secondaryContainer, text-onSecondaryContainer
  // - Elevated: bg-surface, text-primary, shadow-sm / m3 elevation-1
  // - Outlined: border border-outline, text-primary
  // - Text: text-primary, bg-transparent
  // - FAB: bg-primaryContainer, text-onPrimaryContainer, rounded-[16px], shadow-md
  // - Extended FAB: bg-primaryContainer, text-onPrimaryContainer, rounded-[16px], shadow-md, plus text

  const baseStyles = "relative inline-flex items-center justify-center font-medium select-none text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2";
  
  let variantStyles = "";
  let shapeStyles = "rounded-full px-6 h-10"; // standard buttons are fully rounded (pill) in M3
  let shadowStyles = "";

  if (disabled) {
    variantStyles = "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed border-none shadow-none opacity-50";
    if (variant === "outlined") {
      variantStyles = "border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50";
    } else if (variant === "text") {
      variantStyles = "text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50";
    }
  } else {
    switch (variant) {
      case "filled":
        variantStyles = `
          bg-[var(--m3-primary)] text-[var(--m3-on-primary)] 
          hover:shadow-md hover:brightness-105 active:brightness-95
        `;
        break;
      case "tonal":
        variantStyles = `
          bg-[var(--m3-secondary-container)] text-[var(--m3-on-secondary-container)] 
          hover:bg-opacity-90 hover:shadow-sm active:bg-opacity-80
        `;
        break;
      case "elevated":
        variantStyles = `
          bg-[var(--m3-surface)] text-[var(--m3-primary)] 
          hover:shadow-md active:bg-neutral-100 dark:active:bg-neutral-900
        `;
        shadowStyles = "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]";
        break;
      case "outlined":
        variantStyles = `
          border border-[var(--m3-outline)] text-[var(--m3-primary)] bg-transparent
          hover:bg-[var(--m3-primary)] hover:bg-opacity-[0.08] active:bg-opacity-[0.12]
        `;
        break;
      case "text":
        variantStyles = `
          text-[var(--m3-primary)] bg-transparent
          hover:bg-[var(--m3-primary)] hover:bg-opacity-[0.08] active:bg-opacity-[0.12]
        `;
        shapeStyles = "rounded-full px-4 h-10";
        break;
      case "fab":
        variantStyles = `
          bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] 
          hover:shadow-lg hover:brightness-105 active:brightness-95
        `;
        shapeStyles = "rounded-[16px] h-14 w-14"; // 56x56 px
        shadowStyles = "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_6px_rgba(0,0,0,0.5)]";
        break;
      case "extendedFab":
        variantStyles = `
          bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] 
          hover:shadow-lg hover:brightness-105 active:brightness-95
        `;
        shapeStyles = "rounded-[16px] h-14 px-5";
        shadowStyles = "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_6px_rgba(0,0,0,0.5)]";
        break;
    }
  }

  // Adjust horizontal padding if there's an icon in standard buttons
  let paddingStyles = shapeStyles;
  if (!disabled && variant !== "fab" && variant !== "extendedFab" && icon && children) {
    paddingStyles = "rounded-full pl-4 pr-6 h-10";
  }

  return (
    <motion.button
      id={id}
      whileTap={disabled ? {} : { scale: 0.97 }}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${paddingStyles} ${shadowStyles} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="flex items-center justify-center">{icon}</span>}
        {children}
      </div>
    </motion.button>
  );
};
