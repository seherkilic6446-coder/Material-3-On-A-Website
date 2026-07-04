import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface M3SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  discrete?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
  variant?: "standard" | "modern";
}

export const M3Slider: React.FC<M3SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  discrete = false,
  disabled = false,
  label,
  className = "",
  id,
  variant = "modern",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Math to get percentage
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  // Handle manual interaction via click or drag on the track
  const handleInteraction = (clientX: number) => {
    if (disabled || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, relativeX / rect.width));
    const rawVal = pct * (max - min) + min;
    const steppedVal = Math.round(rawVal / step) * step;
    // Clamp
    const finalVal = Math.max(min, Math.min(max, Number(steppedVal.toFixed(2))));
    onChange(finalVal);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    setIsDragging(true);
    setShowTooltip(true);
    handleInteraction(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleInteraction(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShowTooltip(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    setIsDragging(true);
    setShowTooltip(true);
    handleInteraction(e.touches[0].clientX);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      handleInteraction(moveEvent.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setShowTooltip(false);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Generate ticks for discrete slider
  const renderTicks = () => {
    if (!discrete || step === 1) return null;
    const ticksCount = Math.floor((max - min) / step) + 1;
    if (ticksCount > 30) return null; // Avoid overloading ticks

    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {Array.from({ length: ticksCount }).map((_, i) => {
          const tickPct = (i / (ticksCount - 1)) * 100;
          // Tick is active if its position is less than or equal to current percentage
          const active = tickPct <= percentage;
          return (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                disabled
                  ? "bg-neutral-300 dark:bg-neutral-700"
                  : active
                  ? "bg-[var(--m3-on-primary)] opacity-60"
                  : "bg-[var(--m3-on-surface-variant)] opacity-40"
              }`}
              style={{ left: `${tickPct}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div id={id} className={`w-full flex flex-col gap-1.5 py-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-sm font-medium text-[var(--m3-on-surface-variant)]">
          <span>{label}</span>
          <span className="font-mono text-xs">{value}</span>
        </div>
      )}

      {/* Main slider control */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => !disabled && setShowTooltip(true)}
        onMouseLeave={() => !isDragging && setShowTooltip(false)}
        className={`relative h-10 w-full flex items-center cursor-pointer select-none ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        {/* Track Background */}
        {variant === "modern" ? (
          <div className="absolute inset-0 flex items-center pointer-events-none">
            {/* Inactive thin track */}
            <div className="w-full h-1 rounded-full bg-[var(--m3-secondary-container)] opacity-50" />
            
            {/* Active thick track (Material 3 standard: 16dp height, rounded-full) */}
            <div
              className={`absolute left-0 h-4 rounded-full top-1/2 -translate-y-1/2 transition-all duration-75 ${
                disabled
                  ? "bg-neutral-400 opacity-50"
                  : "bg-[var(--m3-primary)]"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        ) : (
          <div className="relative w-full h-1 rounded-full bg-[var(--m3-secondary-container)] overflow-hidden">
            {/* Active track segment */}
            <div
              className="absolute top-0 left-0 h-full bg-[var(--m3-primary)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}

        {/* Ticks for discrete sliders */}
        {discrete && renderTicks()}

        {/* Value Tooltip Indicator (M3 floating bubble) */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.8 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute bg-[var(--m3-primary)] text-[var(--m3-on-primary)] text-xs font-semibold px-2 py-1 rounded-[8px] -translate-x-1/2 flex items-center justify-center shadow-md select-none pointer-events-none z-10"
              style={{ left: `${percentage}%` }}
            >
              {value}
              {/* Caret pointing down */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--m3-primary)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slider Thumb */}
        {variant === "modern" ? (
          <motion.div
            animate={{
              scaleY: isDragging ? 1.05 : 1,
              scaleX: isDragging ? 1.3 : 1,
            }}
            transition={{ duration: 0.1 }}
            className={`absolute top-1/2 -translate-y-1/2 w-1 h-11 rounded-full -translate-x-1/2 flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2 ${
              disabled
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-[var(--m3-primary)] cursor-grab active:cursor-grabbing hover:brightness-110"
            }`}
            style={{ left: `${percentage}%` }}
          >
            {/* Tactile State Layer Overlay */}
            <div className="absolute w-10 h-10 rounded-full bg-[var(--m3-primary)] opacity-0 hover:opacity-[0.08] active:opacity-[0.16] transition-opacity duration-150 pointer-events-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
          </motion.div>
        ) : (
          <motion.div
            animate={{
              scale: isDragging ? 1.4 : 1,
            }}
            transition={{ duration: 0.1 }}
            className={`absolute h-5 w-5 rounded-full -translate-x-1/2 flex items-center justify-center transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2 ${
              disabled
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-[var(--m3-primary)] cursor-grab active:cursor-grabbing"
            }`}
            style={{ left: `${percentage}%` }}
          >
            {/* Internal dot for visual feedback */}
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--m3-on-primary)]" />
          </motion.div>
        )}
      </div>
    </div>
  );
};
