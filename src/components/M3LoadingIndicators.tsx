import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Smartphone, Play, Pause, RotateCcw, ArrowDown } from "lucide-react";
import { M3Card } from "./M3Card";
import { M3Button } from "./M3Button";

// ============================================================================
// MATERIAL 3 SHAPE DEFINITIONS (Official 4 shapes for LoadingIndicator morph)
// ============================================================================

export const MORPH_PATHS = [
  // 1. Perfect Circle
  "M 50 15 C 69.33 15, 85 30.67, 85 50 C 85 69.33, 69.33 85, 50 85 C 30.67 85, 15 69.33, 15 50 C 15 30.67, 30.67 15, 50 15 Z",
  // 2. Squircle
  "M 50 15 C 75 15, 85 25, 85 50 C 85 75, 75 85, 50 85 C 25 85, 15 75, 15 50 C 15 25, 25 15, 50 15 Z",
  // 3. Rounded Triangle
  "M 50 18 C 76 30, 80 65, 70 78 C 60 84, 40 84, 30 78 C 20 65, 24 30, 50 18 Z",
  // 4. Rounded Pentagon
  "M 50 15 C 68 20, 82 32, 80 54 C 78 74, 62 84, 50 84 C 38 84, 22 74, 20 54 C 18 32, 32 20, 50 15 Z"
];

// Morph sequence array to cleanly loop back to start
const MORPH_SEQUENCE = [
  MORPH_PATHS[0], // Circle
  MORPH_PATHS[1], // Squircle
  MORPH_PATHS[2], // Triangle
  MORPH_PATHS[3], // Pentagon
  MORPH_PATHS[0]  // Circle
];

const MORPH_TIMES = [0, 0.25, 0.5, 0.75, 1];

// ============================================================================
// 1. STANDARD CIRCULAR PROGRESS INDICATOR (Material 3 Baseline)
// ============================================================================

interface M3CircularProgressProps {
  progress?: number; // 0 to 1, undefined for indeterminate
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}

export const M3CircularProgress: React.FC<M3CircularProgressProps> = ({
  progress,
  size = 48,
  strokeWidth = 4,
  color = "var(--m3-primary)",
  trackColor = "var(--m3-surface-variant)",
  className = ""
}) => {
  const isIndeterminate = progress === undefined;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Background track circle */}
      <svg viewBox="0 0 50 50" className="absolute inset-0 w-full h-full">
        <circle 
          cx="25" 
          cy="25" 
          r={radius} 
          fill="none" 
          stroke={trackColor} 
          strokeWidth={strokeWidth} 
          className="opacity-40"
        />
      </svg>

      {/* Foreground loading circle */}
      <motion.svg
        viewBox="0 0 50 50"
        className="w-full h-full"
        animate={isIndeterminate ? { rotate: 360 } : { rotate: -90 }}
        transition={
          isIndeterminate 
            ? { repeat: Infinity, duration: 1.4, ease: "linear" }
            : { duration: 0.3 }
        }
      >
        {isIndeterminate ? (
          <motion.circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            animate={{
              strokeDasharray: ["1, 150", "90, 150", "1, 150"],
              strokeDashoffset: [0, -35, -125]
            }}
            transition={{
              duration: 1.4,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />
        ) : (
          <circle
            cx="25"
            cy="25"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (Math.min(1, Math.max(0, progress)) * circumference)}
            className="transition-all duration-300 ease-out"
          />
        )}
      </motion.svg>
    </div>
  );
};

// ============================================================================
// 2. STANDARD LINEAR PROGRESS INDICATOR (Material 3 Baseline)
// ============================================================================

interface M3LinearProgressProps {
  progress?: number; // 0 to 1, undefined for indeterminate
  color?: string;
  trackColor?: string;
  className?: string;
}

export const M3LinearProgress: React.FC<M3LinearProgressProps> = ({
  progress,
  color = "var(--m3-primary)",
  trackColor = "var(--m3-surface-variant)",
  className = ""
}) => {
  const isIndeterminate = progress === undefined;

  return (
    <div className={`relative w-full h-1 bg-[var(--m3-surface-variant)] rounded-full overflow-hidden ${className}`}>
      {isIndeterminate ? (
        <>
          <motion.div
            className="absolute h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ left: "-35%", right: "100%" }}
            animate={{
              left: ["-35%", "100%"],
              right: ["100%", "-5%"]
            }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />
          <motion.div
            className="absolute h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ left: "-100%", right: "100%" }}
            animate={{
              left: ["-100%", "100%"],
              right: ["100%", "-20%"]
            }}
            transition={{
              duration: 1.8,
              delay: 0.6,
              ease: "easeInOut",
              repeat: Infinity
            }}
          />
        </>
      ) : (
        <div 
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ 
            backgroundColor: color, 
            width: `${Math.min(100, Math.max(0, progress * 100))}%` 
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// 3. MORPHING ACTIVITY INDICATOR (Official Shape-morphing Spec)
// ============================================================================

interface M3MorphingActivityIndicatorProps {
  size?: number;
  color?: string;
  bgColor?: string;
  trackColor?: string;
  speed?: number; // duration in seconds for one full loop
  variant?: "filled" | "outlined";
  className?: string;
}

export const M3MorphingActivityIndicator: React.FC<M3MorphingActivityIndicatorProps> = ({
  size = 80,
  color = "var(--m3-primary)",
  bgColor = "var(--m3-primary-container)",
  trackColor,
  speed = 4, // 4s is standard speed for a full morph sequence
  variant = "filled",
  className = ""
}) => {
  const isOutlined = variant === "outlined";
  const finalFill = isOutlined 
    ? (trackColor || "var(--m3-surface-variant)") 
    : color;
  const finalStroke = isOutlined ? color : "none";
  const strokeWidth = isOutlined ? 6 : 0;

  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor
      }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-[75%] h-[75%]"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: speed,
          ease: "linear"
        }}
      >
        <motion.path
          fill={finalFill}
          stroke={finalStroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{
            d: MORPH_SEQUENCE
          }}
          transition={{
            repeat: Infinity,
            duration: speed,
            ease: "easeInOut",
            times: MORPH_TIMES
          }}
        />
      </motion.svg>
    </div>
  );
};

// ============================================================================
// 4. WAVY LINEAR PROGRESS INDICATOR (Android 15 Wavy Style)
// ============================================================================

interface M3WavyLinearProgressProps {
  progress?: number; // 0 to 1, if undefined runs indeterminate
  color?: string;
  trackColor?: string;
  speed?: number;
  amplitude?: number;
  wavelength?: number;
  className?: string;
}

export const M3WavyLinearProgress: React.FC<M3WavyLinearProgressProps> = ({
  progress,
  color = "var(--m3-primary)",
  trackColor = "var(--m3-surface-variant)",
  speed = 1.2,
  amplitude = 5,
  wavelength = 40,
  className = ""
}) => {
  const isIndeterminate = progress === undefined;
  
  // Generating a wavy sinus path
  const wavePath = useMemo(() => {
    const width = 400;
    const points = [];
    
    for (let x = -wavelength; x <= width + wavelength; x += 5) {
      const radians = (x / wavelength) * Math.PI * 2;
      const y = 15 + amplitude * Math.sin(radians);
      if (points.length === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        points.push(`L ${x} ${y}`);
      }
    }
    return points.join(" ");
  }, [amplitude, wavelength]);

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      <div 
        className="relative h-8 rounded-full overflow-hidden w-full flex items-center bg-opacity-30 border border-opacity-10"
        style={{ backgroundColor: trackColor }}
      >
        <svg viewBox="0 0 400 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          {/* Static straight background track for reference */}
          <line 
            x1="0" 
            y1="15" 
            x2="400" 
            y2="15" 
            stroke={trackColor} 
            strokeWidth="4" 
            strokeLinecap="round"
            className="opacity-40"
          />

          {/* Mask container to represent filled progress */}
          <g>
            {/* The active wavy path */}
            <motion.path
              d={wavePath}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              animate={{ x: [-wavelength, 0] }}
              transition={{
                repeat: Infinity,
                duration: speed,
                ease: "linear"
              }}
              style={{
                clipPath: isIndeterminate ? "none" : `inset(0 ${100 - (progress * 100)}% 0 0)`
              }}
            />
          </g>
        </svg>

        {/* Floating progress bead or glow for extra polish */}
        {!isIndeterminate && (
          <motion.div
            className="absolute h-3 w-3 rounded-full shadow-md"
            style={{ 
              backgroundColor: color,
              left: `${progress * 100}%`,
              transform: "translate(-50%, -50%)",
              top: "50%"
            }}
            layout
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 5. WAVY CIRCULAR PROGRESS INDICATOR (Android 15 Wavy Style)
// ============================================================================

interface M3WavyCircularProgressProps {
  progress?: number; // 0 to 1, undefined for indeterminate
  size?: number;
  color?: string;
  trackColor?: string;
  amplitude?: number;
  peaks?: number;
  speed?: number;
  className?: string;
}

export const M3WavyCircularProgress: React.FC<M3WavyCircularProgressProps> = ({
  progress,
  size = 80,
  color = "var(--m3-primary)",
  trackColor = "var(--m3-surface-variant)",
  amplitude = 2.5,
  peaks = 14,
  speed = 2,
  className = ""
}) => {
  const [phase, setPhase] = useState(0);

  // Smooth wave phase animation for the rippling effect
  useEffect(() => {
    let animId: number;
    const start = performance.now();
    
    const update = (now: number) => {
      const elapsed = now - start;
      setPhase((elapsed / 1500) * Math.PI * 2);
      animId = requestAnimationFrame(update);
    };
    
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute the wavy circular path
  const wavyPath = useMemo(() => {
    const points = [];
    const steps = 140;
    const radius = 35; // centered at 50,50
    
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const r = radius + amplitude * Math.sin(peaks * theta - phase);
      const x = 50 + r * Math.cos(theta);
      const y = 50 + r * Math.sin(theta);
      
      if (i === 0) {
        points.push(`M ${x.toFixed(2)} ${y.toFixed(2)}`);
      } else {
        points.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
    }
    return points.join(" ") + " Z";
  }, [amplitude, peaks, phase]);

  const isIndeterminate = progress === undefined;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Background track circle */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-15">
        <circle cx="50" cy="50" r="35" fill="none" stroke={trackColor} strokeWidth="6" />
      </svg>

      {/* The wavy rotating/drawing circular loader */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={isIndeterminate ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isIndeterminate 
            ? { repeat: Infinity, duration: speed, ease: "linear" }
            : {}
        }
      >
        <motion.path
          d={wavyPath}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          animate={
            isIndeterminate
              ? {
                  strokeDasharray: ["10 120", "80 80", "10 120"],
                  strokeDashoffset: [0, -40, -160]
                }
              : {
                  strokeDasharray: "220",
                  strokeDashoffset: 220 - (progress * 220)
                }
          }
          transition={
            isIndeterminate
              ? {
                  repeat: Infinity,
                  duration: speed,
                  ease: "easeInOut"
                }
              : {
                  duration: 0.3,
                  ease: "easeOut"
                }
          }
        />
      </motion.svg>
    </div>
  );
};

// ============================================================================
// 6. MOBILE SIMULATOR WITH SWIPE DOWN TO REFRESH
// ============================================================================

interface M3PullToRefreshSimulatorProps {
  onRefresh?: () => void;
  className?: string;
}

export const M3PullToRefreshSimulator: React.FC<M3PullToRefreshSimulatorProps> = ({
  onRefresh,
  className = ""
}) => {
  const [dragY, setDragY] = useState(0);
  const [refreshState, setRefreshState] = useState<"idle" | "pulling" | "refreshing" | "complete">("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  
  const refreshThreshold = 100; // Trigger threshold in pixels
  const maxDrag = 180; // Limit drag depth

  // Handle manual simulated reload / pull trigger
  const triggerRefresh = () => {
    if (refreshState === "refreshing") return;
    setRefreshState("refreshing");
    setDragY(refreshThreshold);
    
    setTimeout(() => {
      setRefreshState("complete");
      if (onRefresh) onRefresh();
      
      setTimeout(() => {
        setRefreshState("idle");
        setDragY(0);
      }, 800);
    }, 2500);
  };

  // Drag listeners
  const handleDrag = (event: any, info: any) => {
    if (refreshState === "refreshing") return;
    
    // Allow dragging down (positive y offset)
    const newY = Math.max(0, Math.min(maxDrag, info.offset.y));
    setDragY(newY);
    
    if (newY >= refreshThreshold) {
      setRefreshState("pulling");
    } else {
      setRefreshState("idle");
    }
  };

  const handleDragEnd = () => {
    if (refreshState === "refreshing") return;
    
    if (dragY >= refreshThreshold) {
      triggerRefresh();
    } else {
      // Bounce back
      setDragY(0);
      setRefreshState("idle");
    }
  };

  // Mock list elements to pull/refresh
  const [items, setItems] = useState<string[][]>([
    ["Pixel 9 Pro - Fold Redesign", "Google Pixel Fold is here with gorgeous Material 3 styling!"],
    ["Jetpack Compose 1.7.0 Released", "Wavy indicators and morphing elements are now official!"],
    ["Antigravity Workspace Engine", "Experience zero latency sandbox compiler setups in AI Studio."],
    ["Tonal Palette Customizer", "Dynamic theme colors generated automatically from single HEX seed."],
    ["Material 3 Shape-morphing Spec", "Circle to Squircle to Triangle to Pentagon shape animation."]
  ]);

  const handleSimulatedRefresh = () => {
    const titles = [
      "Dynamic Seed Synchronizer",
      "Vibrancy Engine Redesign",
      "Gboard IME Auto-Theme",
      "Framer Motion Spring Physics",
      "Pixel 9 Pro Fold Preview",
      "Aesthetic Slate Layouts"
    ];
    const bodies = [
      "Dynamic theme colors generated automatically in real time.",
      "Vivid Material You baseline matches standard Android setups.",
      "Gboard styling matches virtual keyboards in Android 15.",
      "Zero friction physics engines loaded dynamically on drag.",
      "Clean off-white display elements with deep shadow contrast."
    ];
    
    const newItems = Array.from({ length: 5 }, () => {
      const idxT = Math.floor(Math.random() * titles.length);
      const idxB = Math.floor(Math.random() * bodies.length);
      return [titles[idxT], `${bodies[idxB]} (Just loaded!)`];
    });

    setItems(newItems);
    if (onRefresh) onRefresh();
  };

  // Simulator Event trigger action listener
  useEffect(() => {
    if (refreshState === "complete") {
      handleSimulatedRefresh();
    }
  }, [refreshState]);

  // Calculation of progress ratio
  const pullProgress = Math.min(1, dragY / refreshThreshold);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[var(--m3-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="h-4 w-4" /> Pull To Refresh Simulator
          </span>
          <span className="text-[11px] text-[var(--m3-on-surface-variant)]">
            Drag down the feed inside the smartphone view to test Swipe-Down-To-Refresh!
          </span>
        </div>
        <M3Button variant="outlined" size="small" onClick={triggerRefresh}>
          Simulate Swipe
        </M3Button>
      </div>

      <div className="relative mx-auto w-full max-w-[340px] h-[520px] bg-neutral-900 rounded-[44px] p-3 shadow-2xl border-4 border-neutral-800 ring-8 ring-neutral-950 overflow-hidden select-none">
        {/* Phone Notch/Speaker */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-40 flex items-center justify-center">
          <div className="w-12 h-1 bg-neutral-800 rounded-full" />
          <div className="absolute right-4 w-2 h-2 bg-neutral-900 rounded-full border border-neutral-800" />
        </div>

        {/* Dynamic Pull Indicator Container (floating over the content) */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 z-30 transition-all pointer-events-none"
          style={{
            top: `${Math.max(16, dragY - 35)}px`,
            opacity: pullProgress > 0.1 ? 1 : 0,
            transform: `translate(-50%) scale(${0.7 + pullProgress * 0.3})`
          }}
        >
          {/* Circular M3 container containing the morphing shape indicator */}
          <div className="flex items-center justify-center p-2 rounded-full bg-[var(--m3-surface-container-high)] shadow-lg border border-[var(--m3-outline-variant)] w-12 h-12">
            {refreshState === "refreshing" ? (
              // Active indeterminate morphing loader spinning
              <M3MorphingActivityIndicator 
                size={34} 
                color="var(--m3-primary)" 
                bgColor="transparent" 
                speed={4} 
              />
            ) : (
              // Determinate static/slightly rotated morphing indicator
              <div 
                className="transition-all duration-75"
                style={{ 
                  transform: `rotate(${dragY * 2.5}deg)`,
                  opacity: 0.5 + pullProgress * 0.5 
                }}
              >
                {/* As they pull, it morphs sequentially through the 4 M3 shapes! */}
                <svg viewBox="0 0 100 100" className="w-8 h-8">
                  <path
                    fill="var(--m3-primary)"
                    d={
                      pullProgress < 0.25 
                        ? MORPH_PATHS[0] // circle
                        : pullProgress < 0.5
                        ? MORPH_PATHS[1] // squircle
                        : pullProgress < 0.75
                        ? MORPH_PATHS[2] // triangle
                        : MORPH_PATHS[3] // pentagon
                    }
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Phone screen container */}
        <div 
          ref={containerRef}
          className="w-full h-full bg-[#fbfdf7] dark:bg-[#1a1c18] rounded-[34px] overflow-hidden flex flex-col justify-between relative"
        >
          {/* Header area in phone */}
          <div className="pt-8 px-4 pb-3 border-b border-[var(--m3-outline-variant)] border-opacity-30 bg-[var(--m3-surface-container-low)]">
            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-extrabold tracking-tight text-[var(--m3-on-surface)]">
                Android Feed
              </span>
              <RefreshCw className={`h-3 w-3 text-[var(--m3-primary)] ${refreshState === "refreshing" ? "animate-spin" : ""}`} />
            </div>
          </div>

          {/* Interactive Drag area (Mock feed content list) */}
          <motion.div
            className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 cursor-grab active:cursor-grabbing touch-none select-none"
            drag="y"
            dragConstraints={{ top: 0, bottom: maxDrag }}
            dragElastic={0.15}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            animate={{ y: refreshState === "refreshing" ? refreshThreshold : dragY }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {/* Swipable hint helper */}
            <div className="flex flex-col items-center justify-center py-2 text-center border border-dashed border-[var(--m3-outline-variant)] border-opacity-50 rounded-2xl opacity-65 mb-1 bg-opacity-10 bg-[var(--m3-primary)]">
              <ArrowDown className="h-4 w-4 animate-bounce text-[var(--m3-primary)]" />
              <span className="text-[10px] font-bold text-[var(--m3-primary)]">Swipe down to refresh feed</span>
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => (
                <motion.div
                  key={item[0] + idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 bg-[var(--m3-surface-container)] rounded-2xl border border-[var(--m3-outline-variant)] border-opacity-30 shadow-sm flex flex-col gap-1 hover:brightness-[0.98] transition-all"
                >
                  <span className="text-xs font-bold text-[var(--m3-on-surface)]">
                    {item[0]}
                  </span>
                  <span className="text-[10px] text-[var(--m3-on-surface-variant)] leading-normal">
                    {item[1]}
                  </span>
                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[var(--m3-outline-variant)] border-opacity-20">
                    <span className="text-[9px] font-semibold uppercase text-[var(--m3-primary)]">
                      System Notification
                    </span>
                    <span className="text-[9px] text-[var(--m3-on-surface-variant)]">
                      Just now
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Bottom navigation bar in phone */}
          <div className="py-2.5 bg-[var(--m3-surface-container-low)] border-t border-[var(--m3-outline-variant)] border-opacity-30 flex items-center justify-center">
            <div className="w-28 h-1 bg-neutral-400 dark:bg-neutral-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN WRAPPER: SHOWCASE SECTION EXPOSING BASELINE & DYNAMIC REPLICAS
// ============================================================================

export const M3LoadingIndicatorsShowcase: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedSetting, setSpeedSetting] = useState<"slow" | "normal" | "fast">("normal");
  const [peaks, setPeaks] = useState(14);
  const [amplitude, setAmplitude] = useState(2.5);
  const [determinateVal, setDeterminateVal] = useState(0.45);

  const activeSpeed = useMemo(() => {
    if (speedSetting === "slow") return 6;
    if (speedSetting === "fast") return 2;
    return 4; // normal
  }, [speedSetting]);

  // Handle auto progress simulator
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setDeterminateVal(prev => {
        const next = prev + 0.01;
        return next > 1 ? 0 : next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-[var(--m3-on-surface)]">
          Material 3 Dynamic Loading Indicators
        </h3>
        <p className="text-sm text-[var(--m3-on-surface-variant)]">
          High-fidelity React & Framer Motion replicas of both standard Material 3 progress loaders and the brand new experimental morphing / wavy indicators featured in Android 14 and 15.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Indicators Workspace column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Controls Bar */}
          <M3Card variant="filled" className="p-4 rounded-3xl">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                Simulation Controls
              </span>
              <div className="flex flex-wrap gap-3 items-center justify-between">
                {/* Speed Setting */}
                <div className="flex items-center gap-1 bg-[var(--m3-surface-container)] p-1 rounded-full border border-[var(--m3-outline-variant)]">
                  <span className="text-[11px] px-2.5 font-bold text-neutral-500">Speed:</span>
                  {(["slow", "normal", "fast"] as const).map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSpeedSetting(spd)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        speedSetting === spd 
                          ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      {spd.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Progress simulator */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] rounded-full hover:brightness-95 active:scale-95 transition-all"
                    title={isPlaying ? "Pause determinate simulator" : "Play determinate simulator"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setDeterminateVal(0)}
                    className="p-2 bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)] rounded-full hover:brightness-95 active:scale-95 transition-all border border-[var(--m3-outline-variant)]"
                    title="Reset simulation progress"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-400">Determinate progress:</span>
                    <span className="text-xs font-mono font-bold text-[var(--m3-primary)]">
                      {Math.round(determinateVal * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </M3Card>

          {/* 1. Baseline Material 3 Indicators */}
          <M3Card variant="outlined" className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--m3-outline-variant)]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--m3-primary)]">
                    1. Baseline Progress Indicators
                  </span>
                  <span className="text-xs text-[var(--m3-on-surface-variant)]">
                    The core, production-ready circular and linear progress indicators required by the baseline Material 3 spec.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6 p-6 bg-[var(--m3-surface-container)] rounded-[24px]">
                {/* Circular Row */}
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-around">
                  {/* Indeterminate Circular */}
                  <div className="flex flex-col items-center gap-2">
                    <M3CircularProgress size={48} strokeWidth={4} />
                    <span className="text-[10px] font-mono text-neutral-400">Circular Indeterminate</span>
                  </div>

                  {/* Determinate Circular */}
                  <div className="flex flex-col items-center gap-2">
                    <M3CircularProgress size={48} strokeWidth={4} progress={determinateVal} />
                    <span className="text-[10px] font-mono text-neutral-400">Circular Determinate</span>
                  </div>
                </div>

                <div className="border-t border-[var(--m3-outline-variant)] border-opacity-30 my-2" />

                {/* Linear Indeterminate */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400">Linear Indeterminate:</span>
                  <M3LinearProgress />
                </div>

                {/* Linear Determinate */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-neutral-400">Linear Determinate:</span>
                  <M3LinearProgress progress={determinateVal} />
                </div>
              </div>
            </div>
          </M3Card>

          {/* 2. Shape-shifting Morphing Indicator Demo */}
          <M3Card variant="outlined" className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--m3-outline-variant)]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--m3-primary)]">
                    2. Shape-shifting Morphing Indicator
                  </span>
                  <span className="text-xs text-[var(--m3-on-surface-variant)]">
                    Polygonal shape morphing sequentially (Circle ➔ Squircle ➔ Triangle ➔ Pentagon ➔ Circle) as defined in the official Material 3 specification.
                  </span>
                </div>
              </div>

              {/* Grid showcasing both Filled and Outlined variants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filled Row */}
                <div className="flex flex-col gap-3 p-5 bg-[var(--m3-surface-container)] rounded-[24px]">
                  <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                    Filled Variant
                  </span>
                  <div className="flex gap-4 items-center justify-around py-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <M3MorphingActivityIndicator 
                        size={64} 
                        color="var(--m3-primary)" 
                        bgColor="var(--m3-primary-container)" 
                        speed={activeSpeed} 
                        variant="filled"
                      />
                      <span className="text-[10px] font-mono text-neutral-400">Primary</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <M3MorphingActivityIndicator 
                        size={56} 
                        color="var(--m3-secondary)" 
                        bgColor="var(--m3-secondary-container)" 
                        speed={activeSpeed * 0.8} 
                        variant="filled"
                      />
                      <span className="text-[10px] font-mono text-neutral-400">Secondary</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <M3MorphingActivityIndicator 
                        size={48} 
                        color="var(--m3-tertiary)" 
                        bgColor="var(--m3-tertiary-container)" 
                        speed={activeSpeed * 0.6} 
                        variant="filled"
                      />
                      <span className="text-[10px] font-mono text-neutral-400">Tertiary</span>
                    </div>
                  </div>
                </div>

                {/* Outlined Row */}
                <div className="flex flex-col gap-3 p-5 bg-[var(--m3-surface-container)] rounded-[24px]">
                  <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                    Outlined (Hollow) Variant
                  </span>
                  <div className="flex gap-4 items-center justify-around py-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <M3MorphingActivityIndicator 
                        size={64} 
                        color="var(--m3-primary)" 
                        bgColor="var(--m3-primary-container)" 
                        trackColor="rgba(var(--m3-primary-rgb, 103, 80, 164), 0.08)"
                        speed={activeSpeed} 
                        variant="outlined"
                      />
                      <span className="text-[10px] font-mono text-neutral-400">Primary</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <M3MorphingActivityIndicator 
                        size={56} 
                        color="var(--m3-secondary)" 
                        bgColor="var(--m3-secondary-container)" 
                        trackColor="rgba(var(--m3-secondary-rgb, 98, 91, 113), 0.08)"
                        speed={activeSpeed * 0.8} 
                        variant="outlined"
                      />
                      <span className="text-[10px] font-mono text-neutral-400">Secondary</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <M3MorphingActivityIndicator 
                        size={48} 
                        color="var(--m3-tertiary)" 
                        bgColor="var(--m3-tertiary-container)" 
                        trackColor="rgba(var(--m3-tertiary-rgb, 125, 82, 96), 0.08)"
                        speed={activeSpeed * 0.6} 
                        variant="outlined"
                      />
                      <span className="text-[10px] font-mono text-neutral-400">Tertiary</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </M3Card>

          {/* 3. Wavy Linear Progress Indicator Demo */}
          <M3Card variant="outlined" className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--m3-outline-variant)]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--m3-primary)]">
                    3. Wavy Linear Progress Indicator
                  </span>
                  <span className="text-xs text-[var(--m3-on-surface-variant)]">
                    Horizontal sinusoidal track loader representing the brand new Android 15 waves.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6 p-4 bg-[var(--m3-surface-container)] rounded-[24px]">
                {/* Indeterminate Wavy */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-400">Indeterminate State:</span>
                  <M3WavyLinearProgress />
                </div>

                {/* Determinate Wavy */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-neutral-400">Determinate State (Synced):</span>
                  <M3WavyLinearProgress progress={determinateVal} />
                </div>
              </div>
            </div>
          </M3Card>

          {/* 4. Wavy Circular Progress Indicator Demo */}
          <M3Card variant="outlined" className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--m3-outline-variant)]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--m3-primary)]">
                    4. Wavy Circular Progress Indicator
                  </span>
                  <span className="text-xs text-[var(--m3-on-surface-variant)]">
                    Scalloped circular track loading with rotating ripple action featured in Android 15.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Sliders to customize waves dynamically */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-[var(--m3-surface-variant)] rounded-2xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-neutral-400">Scallop Peaks ({peaks}):</span>
                    <input 
                      type="range" 
                      min="6" 
                      max="24" 
                      value={peaks} 
                      onChange={(e) => setPeaks(Number(e.target.value))} 
                      className="w-full accent-[var(--m3-primary)]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-neutral-400">Wave Amplitude ({amplitude}px):</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="6" 
                      step="0.5"
                      value={amplitude} 
                      onChange={(e) => setAmplitude(Number(e.target.value))} 
                      className="w-full accent-[var(--m3-primary)]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center justify-around p-6 bg-[var(--m3-surface-container)] rounded-[24px]">
                  {/* Indeterminate scallop */}
                  <div className="flex flex-col items-center gap-2">
                    <M3WavyCircularProgress 
                      size={72} 
                      peaks={peaks} 
                      amplitude={amplitude} 
                    />
                    <span className="text-[10px] font-mono text-neutral-400">Indeterminate Scallop</span>
                  </div>

                  {/* Determinate scallop */}
                  <div className="flex flex-col items-center gap-2">
                    <M3WavyCircularProgress 
                      size={72} 
                      peaks={peaks} 
                      amplitude={amplitude} 
                      progress={determinateVal} 
                    />
                    <span className="text-[10px] font-mono text-neutral-400">Determinate Scallop</span>
                  </div>
                </div>
              </div>
            </div>
          </M3Card>

          {/* 5. Small & Fast Determinate Loading Screen Indicator */}
          <M3Card variant="outlined" className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--m3-outline-variant)]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--m3-primary)]">
                    5. Small & Faster Determinate Indicator
                  </span>
                  <span className="text-xs text-[var(--m3-on-surface-variant)]">
                    A space-optimized, high-speed circular loader (32px diameter, 3.5px stroke width) designed specifically for rapid initial startup/splash sequences.
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-around p-6 bg-[var(--m3-surface-container)] rounded-[24px]">
                  {/* Indeterminate State */}
                  <div className="flex flex-col items-center gap-2">
                    <M3CircularProgress 
                      size={32} 
                      strokeWidth={3.5} 
                      color="var(--m3-primary)" 
                    />
                    <span className="text-[10px] font-mono text-neutral-400">Small Indeterminate (32px)</span>
                  </div>

                  {/* Determinate State - synced with showcase value */}
                  <div className="flex flex-col items-center gap-2">
                    <M3CircularProgress 
                      size={32} 
                      strokeWidth={3.5} 
                      progress={determinateVal} 
                      color="var(--m3-primary)" 
                    />
                    <span className="text-[10px] font-mono text-neutral-400">Small Determinate (32px)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--m3-surface-variant)] text-xs text-[var(--m3-on-surface-variant)] leading-relaxed flex flex-col gap-2">
                  <span className="font-bold text-[var(--m3-primary)]">Why Small and Faster?</span>
                  <p>
                    By reducing the diameter from the standard 48px to **32px** and fine-tuning the stroke weight, the loader occupies minimal visual footprint. An accelerated progression timeline (1.2 seconds) gives the interface an energetic, highly responsive feel compared to traditional heavy loaders.
                  </p>
                </div>
              </div>
            </div>
          </M3Card>
        </div>

        {/* 2. Pull-To-Refresh Simulator Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <M3PullToRefreshSimulator />
        </div>
      </div>
    </div>
  );
};
