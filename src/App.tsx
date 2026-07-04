import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  Info,
  CheckCircle2,
  Mail,
  Search,
  Plus,
  Play,
  Pause,
  Heart,
  Sliders,
  HelpCircle,
  Layers,
  Code,
  Smartphone,
  Eye,
  Settings,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Tv,
  Keyboard,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { generateM3ThemeFromSeed, applyM3ThemeToCssVariables } from "./utils/colorUtils";
import { PresetSeedColor } from "./types";
import { M3Switch } from "./components/M3Switch";
import { M3Button } from "./components/M3Button";
import { M3Card } from "./components/M3Card";
import { M3TextField } from "./components/M3TextField";
import { M3Chip } from "./components/M3Chips";
import { M3SegmentedButton, M3SegmentOption } from "./components/M3SegmentedButton";
import { M3Slider } from "./components/M3Slider";
import { M3Dialog } from "./components/M3Dialog";
import { PaletteGenerator } from "./components/PaletteGenerator";
import { M3Dropdown } from "./components/M3Dropdown";
import { M3Checkbox } from "./components/M3Checkbox";
import { M3Radio } from "./components/M3Radio";
import { M3VirtualKeyboard } from "./components/M3VirtualKeyboard";
import { M3LoadingIndicatorsShowcase, M3MorphingActivityIndicator, MORPH_PATHS, M3CircularProgress } from "./components/M3LoadingIndicators";
import { M3ColorPicker } from "./components/M3ColorPicker";

const PRESET_COLORS: PresetSeedColor[] = [
  { name: "Default Violet", hex: "#6750A4", description: "Standard Material 3 baseline key color." },
  { name: "Teal Jade", hex: "#006A60", description: "A calming organic green-blue shade." },
  { name: "Royal Blue", hex: "#005FAF", description: "A professional and deep marine blue." },
  { name: "Vibrant Rose", hex: "#B3261E", description: "An energetic crimson with high contrast." },
  { name: "Amber Gold", hex: "#7D5800", description: "Warm, grounding desert ochre tones." },
];

export default function App() {
  // Theme state
  const [seedColor, setSeedColor] = useState<string>("#6750A4");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [themeName, setThemeName] = useState<string>("Baseline Violet");

  // Dynamic generated theme palettes
  const theme = generateM3ThemeFromSeed(seedColor, themeName);
  const activePalette = isDark ? theme.dark : theme.light;

  // Components state
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Loading Screen states (uses small & faster circular progress)
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // 1.2s Fast initial load progression
  useEffect(() => {
    if (!showLoadingScreen) return;
    
    setLoadingProgress(0);
    const duration = 1200; // 1.2s Fast
    const startTime = performance.now();
    let animId: number;
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const prog = Math.min(1, elapsed / duration);
      setLoadingProgress(prog);
      
      if (prog < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setShowLoadingScreen(false);
        }, 120);
      }
    };
    
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [showLoadingScreen]);

  // Interactive Switch States
  const [switch1, setSwitch1] = useState<boolean>(true);
  const [switch2, setSwitch2] = useState<boolean>(false); // with icons
  const [switch3, setSwitch3] = useState<boolean>(true);  // disabled toggle base
  const [switchTheme, setSwitchTheme] = useState<boolean>(isDark); // custom sun/moon toggle

  // Sync custom switchTheme state with general isDark state
  useEffect(() => {
    setSwitchTheme(isDark);
  }, [isDark]);

  // Interactive Button Click Counter
  const [clickCount, setClickCount] = useState<number>(0);

  // Interactive Chip States
  const [selectedChips, setSelectedChips] = useState<string[]>(["filter-1"]);
  const [inputChips, setInputChips] = useState<string[]>([
    "Material 3",
    "Material You",
    "Design Tokens",
  ]);

  // Segmented Button states
  const [selectedSegmentSingle, setSelectedSegmentSingle] = useState<string>("phone");
  const [selectedSegmentMulti, setSelectedSegmentMulti] = useState<string[]>(["wifi"]);
  const [selectedSize, setSelectedSize] = useState<string>("8oz");

  // Text Field states
  const [textFieldOutlined, setTextFieldOutlined] = useState<string>("");
  const [textFieldFilled, setTextFieldFilled] = useState<string>("");
  const [textFieldError, setTextFieldError] = useState<string>("Invalid input format");
  const [textFieldWithIcon, setTextFieldWithIcon] = useState<string>("");

  // Slider States
  const [sliderContinuous, setSliderContinuous] = useState<number>(45);
  const [sliderDiscrete, setSliderDiscrete] = useState<number>(3);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showColorPickerDialog, setShowColorPickerDialog] = useState<boolean>(false);
  
  // --- VIRTUAL KEYBOARD STATES ---
  const [chatMessages, setChatMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([
    { sender: "bot", text: "Welcome to the Material 3 Gboard showcase! Click the input field below and start typing on our responsive keys." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [globalKeyboardEnabled, setGlobalKeyboardEnabled] = useState(false);
  const [isGlobalKeyboardOpen, setIsGlobalKeyboardOpen] = useState(false);

  // Virtual Keyboard auto-popup effect
  useEffect(() => {
    if (!globalKeyboardEnabled) return;
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setIsGlobalKeyboardOpen(true);
      }
    };

    document.addEventListener("focusin", handleFocus);
    return () => {
      document.removeEventListener("focusin", handleFocus);
    };
  }, [globalKeyboardEnabled]);

  // Global pull-to-refresh states
  const [globalDragY, setGlobalDragY] = useState(0);
  const [globalRefreshState, setGlobalRefreshState] = useState<"idle" | "pulling" | "refreshing" | "complete">("idle");
  const [showGlobalToast, setShowGlobalToast] = useState(false);

  const startY = useRef(0);
  const isDragging = useRef(false);

  const triggerGlobalRefresh = () => {
    setGlobalRefreshState("refreshing");
    setGlobalDragY(80); // Hold it at refreshing height
    
    // Simulate refreshing page content
    setTimeout(() => {
      setGlobalRefreshState("complete");
      setShowGlobalToast(true);
      
      // Randomize theme color to simulate fresh loaded state!
      const randomColors = ["#6750A4", "#386a20", "#005faf", "#9c4146", "#605e5d", "#5c53a7"];
      const chosenColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      setSeedColor(chosenColor);
      setThemeName("Global Dynamic Seed Refresh");
      
      setTimeout(() => {
        setGlobalRefreshState("idle");
        setGlobalDragY(0);
        
        setTimeout(() => {
          setShowGlobalToast(false);
        }, 3000);
      }, 800);
    }, 2200);
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && globalRefreshState === "idle") {
        startY.current = e.touches[0].clientY;
        isDragging.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || window.scrollY > 0 || globalRefreshState === "refreshing") return;
      const currentY = e.touches[0].clientY;
      const diffY = currentY - startY.current;
      if (diffY > 15) {
        // Prevent default browser pulldown bounce
        if (e.cancelable) e.preventDefault();
        const resistance = Math.min(150, diffY * 0.4);
        setGlobalDragY(resistance);
        if (resistance >= 80) {
          setGlobalRefreshState("pulling");
        } else {
          setGlobalRefreshState("idle");
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (globalDragY >= 80) {
        triggerGlobalRefresh();
      } else {
        setGlobalDragY(0);
        setGlobalRefreshState("idle");
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Avoid dragging if target is button or slider
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("input") || target.closest("select") || target.closest("[role='slider']")) {
        return;
      }
      if (window.scrollY === 0 && globalRefreshState === "idle") {
        startY.current = e.clientY;
        isDragging.current = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || window.scrollY > 0 || globalRefreshState === "refreshing") return;
      const currentY = e.clientY;
      const diffY = currentY - startY.current;
      if (diffY > 15) {
        const resistance = Math.min(150, diffY * 0.4);
        setGlobalDragY(resistance);
        if (resistance >= 80) {
          setGlobalRefreshState("pulling");
        } else {
          setGlobalRefreshState("idle");
        }
      }
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (globalDragY >= 80) {
        triggerGlobalRefresh();
      } else {
        setGlobalDragY(0);
        setGlobalRefreshState("idle");
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [globalDragY, globalRefreshState]);
  
  // Slider Variant State
  const [sliderStyleVariant, setSliderStyleVariant] = useState<"modern" | "standard">("modern");
  
  // Segmented Button Variant State
  const [segmentedStyleVariant, setSegmentedStyleVariant] = useState<"modern" | "standard">("modern");

  // --- FULL DOWN TEST BED STATES ---
  const [dropdownOutlined, setDropdownOutlined] = useState<string>("phone");
  const [dropdownFilled, setDropdownFilled] = useState<string>("light");
  const [dropdownWithIcon, setDropdownWithIcon] = useState<string>("wifi");

  const [switchVolume, setSwitchVolume] = useState<boolean>(true);
  const [switchLock, setSwitchLock] = useState<boolean>(false);
  const [switchPlay, setSwitchPlay] = useState<boolean>(true);

  const [checkboxItem1, setCheckboxItem1] = useState<boolean>(true);
  const [checkboxItem2, setCheckboxItem2] = useState<boolean>(false);
  const [checkboxItemIndeterminate, setCheckboxItemIndeterminate] = useState<boolean | "indeterminate">("indeterminate");

  const [radioSelection, setRadioSelection] = useState<string>("auto");

  const handlePresetSelect = (preset: PresetSeedColor) => {
    setSeedColor(preset.hex);
    setThemeName(preset.name);
  };

  const handleChipClick = (id: string) => {
    if (selectedChips.includes(id)) {
      setSelectedChips(selectedChips.filter((c) => c !== id));
    } else {
      setSelectedChips([...selectedChips, id]);
    }
  };

  const handleRemoveInputChip = (label: string) => {
    setInputChips(inputChips.filter((chip) => chip !== label));
  };

  const handleSegmentSingleChange = (value: string) => {
    setSelectedSegmentSingle(value);
  };

  const handleSegmentMultiChange = (value: string) => {
    if (selectedSegmentMulti.includes(value)) {
      setSelectedSegmentMulti(selectedSegmentMulti.filter((v) => v !== value));
    } else {
      setSelectedSegmentMulti([...selectedSegmentMulti, value]);
    }
  };

  // Convert active theme colors to style object containing standard css vars
  const cssVariables = applyM3ThemeToCssVariables(activePalette);

  // Apply general background and foreground classes dynamically
  return (
    <div
      style={cssVariables as React.CSSProperties}
      className="min-h-screen font-sans bg-[var(--m3-background)] text-[var(--m3-on-background)] transition-colors duration-300 flex flex-col selection:bg-[var(--m3-primary-container)] selection:text-[var(--m3-on-primary-container)]"
    >
      {/* Dynamic Small/Fast Circular Determinate Loading Screen Overlay */}
      <AnimatePresence>
        {showLoadingScreen && (
          <motion.div
            key="global-loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--m3-surface)] text-[var(--m3-on-surface)]"
          >
            <div className="flex flex-col items-center gap-6 max-w-xs text-center px-4">
              {/* Dynamic Theme Seed Colored Icon Block */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4, type: "spring" }}
                className="h-16 w-16 rounded-[20px] bg-[var(--m3-primary-container)] flex items-center justify-center text-[var(--m3-on-primary-container)] shadow-md border border-[var(--m3-outline-variant)] border-opacity-35"
              >
                <Palette className="h-8 w-8 text-[var(--m3-primary)]" />
              </motion.div>

              {/* Title Header */}
              <div className="flex flex-col gap-1.5">
                <motion.h2
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-2xl font-extrabold tracking-tight text-[var(--m3-on-surface)]"
                >
                  Material 3 Showcase
                </motion.h2>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="text-xs font-semibold text-[var(--m3-on-surface-variant)] tracking-wide"
                >
                  Synthesizing adaptive design system...
                </motion.p>
              </div>

              {/* Determinate Indicator with small size & faster rate */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-2 mt-4"
              >
                <M3CircularProgress
                  progress={loadingProgress}
                  size={32}
                  strokeWidth={3.5}
                  color="var(--m3-primary)"
                  trackColor="var(--m3-surface-variant)"
                />
                <span className="text-[11px] font-mono font-bold text-[var(--m3-primary)]">
                  {Math.round(loadingProgress * 100)}%
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Pull To Refresh Indicator overlay */}
      <AnimatePresence>
        {globalDragY > 15 && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: globalDragY - 50 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none flex items-center justify-center"
            style={{ top: "60px" }}
          >
            <div className="flex items-center justify-center p-2 rounded-full bg-[var(--m3-surface-container-high)] shadow-xl border border-[var(--m3-outline-variant)] w-14 h-14">
              {globalRefreshState === "refreshing" ? (
                <M3MorphingActivityIndicator 
                  size={38} 
                  color="var(--m3-primary)" 
                  bgColor="transparent" 
                  speed={4} 
                />
              ) : (
                <div 
                  style={{ 
                    transform: `rotate(${globalDragY * 3}deg)`,
                    opacity: 0.5 + Math.min(1, globalDragY / 80) * 0.5 
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-10 h-10">
                    <path
                      fill="var(--m3-primary)"
                      d={
                        globalDragY < 35 
                          ? MORPH_PATHS[0] // circle
                          : globalDragY < 60
                          ? MORPH_PATHS[1] // squircle
                          : globalDragY < 85
                          ? MORPH_PATHS[2] // triangle
                          : MORPH_PATHS[3] // pentagon
                      }
                    />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Refresh Success Toast */}
      <AnimatePresence>
        {showGlobalToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] px-6 py-3.5 rounded-full shadow-lg flex items-center gap-2.5 text-xs font-bold"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Feed refreshed & randomized dynamic seed color!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR (M3 standard Surface height) */}
      <header className="sticky top-0 z-30 w-full border-b border-[var(--m3-outline-variant)] bg-[var(--m3-surface)] text-[var(--m3-on-surface)] transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-[var(--m3-primary-container)] flex items-center justify-center text-[var(--m3-on-primary-container)]">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Material 3 Showcase</h1>
              <p className="text-[10px] font-mono opacity-70">Google Design System & Component Library</p>
            </div>
          </div>

          {/* Quick theme actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--m3-on-surface-variant)]">
                Seed: <span className="font-bold">{seedColor.toUpperCase()}</span>
              </span>
              <div
                className="h-4 w-4 rounded-full border border-[var(--m3-outline)] shadow-sm"
                style={{ backgroundColor: seedColor }}
              />
            </div>

            {/* Quick Sun/Moon Toggle */}
            <div className="flex items-center gap-2 border-l border-[var(--m3-outline-variant)] pl-4">
              <M3Switch
                checked={isDark}
                onChange={(val) => setIsDark(val)}
                showIcons={true}
                customIcons={{
                  checked: <Moon className="h-3 w-3 stroke-[2.5]" />,
                  unchecked: <Sun className="h-3 w-3 stroke-[2.5]" />,
                }}
              />
              <span className="text-xs font-semibold select-none text-[var(--m3-on-surface-variant)] hidden md:inline">
                {isDark ? "Dark Theme" : "Light Theme"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN: Seed Color Engine & Controller (Sticks to top on desktop) */}
        <section className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <M3Card variant="elevated" className="h-auto">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-[var(--m3-primary)]" />
              <h2 className="text-base font-bold text-[var(--m3-on-surface)]">
                Theme Customizer
              </h2>
            </div>

            <p className="text-xs text-[var(--m3-on-surface-variant)] mb-5 leading-relaxed">
              Material 3 introduces **Material You**, generating matching dynamic tonal palettes from a single seed color. Try picking any color below to apply it across all components!
            </p>

            {/* M3 Color Picker Dialog Trigger Button */}
            <M3Button
              variant="filled"
              onClick={() => setShowColorPickerDialog(true)}
              className="w-full mb-6 py-3 rounded-full font-bold shadow-sm"
            >
              Show color picker dialog
            </M3Button>

            {/* Seed Color Selector */}
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
                Select custom seed
              </label>
              <div className="flex gap-3 items-center">
                <div
                  onClick={() => setShowColorPickerDialog(true)}
                  style={{ backgroundColor: seedColor }}
                  className="h-10 w-12 rounded-[12px] cursor-pointer border border-[var(--m3-outline)] shadow-inner transition-transform hover:scale-105 active:scale-95 shrink-0"
                  title="Open Color Picker Dialog"
                />
                <M3TextField
                  label="Hex Code"
                  value={seedColor}
                  onChange={(val) => {
                    if (val.startsWith("#") && val.length <= 7) {
                      setSeedColor(val);
                      setThemeName("Custom Palette");
                    }
                  }}
                  variant="outlined"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
                Preset Seeds
              </label>
              <div className="flex flex-col gap-2">
                {PRESET_COLORS.map((preset) => {
                  const isActive = seedColor.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`
                        w-full flex items-center justify-between p-2.5 rounded-[12px] text-xs font-semibold text-left transition-all duration-200 border
                        ${
                          isActive
                            ? "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] border-[var(--m3-primary)] shadow-sm scale-[1.02]"
                            : "bg-transparent border-[var(--m3-outline-variant)] hover:bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface)]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full border border-black border-opacity-10 shadow-inner shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                      </div>
                      <span className="font-mono text-[10px] opacity-60">
                        {preset.hex.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Initial Splash Simulator */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--m3-outline-variant)] border-opacity-30">
              <label className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
                Initial Splash Simulator
              </label>
              <M3Button
                variant="outlined"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={() => setShowLoadingScreen(true)}
                className="w-full"
              >
                Replay Loading Screen
              </M3Button>
              <p className="text-[10px] text-[var(--m3-on-surface-variant)] leading-normal mt-1">
                Simulates startup using a **Small & Faster** Circular Determinate indicator (1.2s).
              </p>
            </div>
          </M3Card>

          {/* Quick Info card */}
          <M3Card variant="filled" className="hidden lg:flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--m3-primary)]" />
              <h3 className="text-xs font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
                Design Spec Info
              </h3>
            </div>
            <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed">
              Material 3 (M3) represents Google's current design standard. Core enhancements include **organic expressive shapes** (extra round 28px corners), **state layer opacities** for precise micro-interactions, and **inclusive high-contrast typography** utilizing Google's Nunito font family.
            </p>
          </M3Card>
        </section>

        {/* RIGHT COLUMN: Interactive Component Playground & Explanation Tabs */}
        <section className="flex-1 flex flex-col gap-8">
          {/* NAVIGATION TAB LAYOUT (Material 3 Segmented Button style tab selector) */}
          <div className="flex justify-center md:justify-start w-full">
            <M3SegmentedButton
              options={[
                { value: "overview", label: "Overview", icon: <Info className="h-4 w-4" /> },
                { value: "components", label: "Components", icon: <Layers className="h-4 w-4" /> },
                { value: "loading", label: "Loading (M3)", icon: <RefreshCw className="h-4 w-4" /> },
                { value: "keyboard", label: "Gboard (M3)", icon: <Keyboard className="h-4 w-4" /> },
                { value: "fulldowntest", label: "Full Down Test Bed", icon: <Sliders className="h-4 w-4" /> },
                { value: "palette", label: "Tonal Palette", icon: <Palette className="h-4 w-4" /> },
              ]}
              selectedValue={activeTab}
              onChange={(val) => setActiveTab(val)}
            />
          </div>

          {/* TAB CONTENT: 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              {/* Feature Hero Card */}
              <M3Card variant="elevated" className="overflow-hidden">
                <div className="absolute top-0 right-0 h-48 w-48 bg-[var(--m3-primary)] rounded-full blur-[100px] opacity-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--m3-on-surface)]">
                    Exploring Material Design 3
                  </h2>
                  <p className="text-sm text-[var(--m3-on-surface-variant)] leading-relaxed max-w-2xl">
                    Material 3 is Google's most personal, adaptive, and expressive design system. Built on the core concept of dynamic customization, it adapts to users' backgrounds, lighting parameters, and accessibility needs in real time, delivering a beautiful unified visual experience.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-[var(--m3-surface-variant)] p-4 rounded-[20px] border border-[var(--m3-outline-variant)]">
                      <h3 className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider mb-1">
                        Dynamic Colors
                  </h3>
                      <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed">
                        Algorithms extract matching hues from a single seed color, automatically formatting standard light and dark color schemes that maintain perfect AA accessibility contrast.
                      </p>
                    </div>

                    <div className="bg-[var(--m3-surface-variant)] p-4 rounded-[20px] border border-[var(--m3-outline-variant)]">
                      <h3 className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider mb-1">
                        Expressive Shapes
                  </h3>
                      <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed">
                        Components transition from rigid corners to friendly, fully rounded pills, or organic large 28px rounded sheets, presenting an approachable aesthetic.
                      </p>
                    </div>

                    <div className="bg-[var(--m3-surface-variant)] p-4 rounded-[20px] border border-[var(--m3-outline-variant)]">
                      <h3 className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider mb-1">
                        Adaptive Typography
                  </h3>
                      <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed">
                        Utilizing highly readable display headings and clear body copy styled with **Nunito**, ensuring elegant balance across responsive device layout states.
                      </p>
                    </div>
                  </div>
                </div>
              </M3Card>

              {/* What makes up M3 Card List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <M3Card variant="outlined">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-[var(--m3-on-surface)]">
                    <Smartphone className="h-5 w-5 text-[var(--m3-primary)]" />
                    Adaptive Component Layouts
                  </h3>
                  <p className="text-sm text-[var(--m3-on-surface-variant)] leading-relaxed mb-4">
                    In Material 3, buttons, navigation, cards, and input modules are sized with optimal padding to accommodate touch inputs on mobile tablets as well as precise mouse cursors on desktop displays. Hover indicators dynamically grow and state layers visually indicate active focal points.
                  </p>
                  <M3Button variant="tonal" onClick={() => setActiveTab("components")}>
                    Try Components
                  </M3Button>
                </M3Card>

                <M3Card variant="outlined">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-[var(--m3-on-surface)]">
                    <Palette className="h-5 w-5 text-[var(--m3-primary)]" />
                    Dynamic System Palettes
                  </h3>
                  <p className="text-sm text-[var(--m3-on-surface-variant)] leading-relaxed mb-4">
                    Every color role in Material 3 maps to an explicit semantic purpose (e.g., Primary Container vs Secondary Container). This prevents arbitrary background or text shading, maintaining layout consistency regardless of the seed color colorways.
                  </p>
                  <M3Button variant="outlined" onClick={() => setActiveTab("palette")}>
                    Inspect Tonal Scheme
                  </M3Button>
                </M3Card>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. INTERACTIVE COMPONENTS */}
          {activeTab === "components" && (
            <div className="flex flex-col gap-8">
              {/* 1. SELECTION CONTROLS (SWITCHES WITH ICON, CHIPS, AND SEGMENTED BUTTONS) */}
              <div className="flex flex-col gap-4 border-b border-[var(--m3-outline-variant)] pb-8">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-[var(--m3-on-surface)]">
                    Selection & Segment Controls
                  </h3>
                  <p className="text-sm text-[var(--m3-on-surface-variant)]">
                    Interactive components to toggle settings, filter content, and toggle specific layouts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SWITCH WORKBENCH */}
                  <M3Card variant="outlined" className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--m3-primary)] uppercase tracking-wider mb-4">
                        Switch with Icon
                      </h4>
                      <p className="text-xs text-[var(--m3-on-surface-variant)] mb-4">
                        Material 3 switches feature an optional icon inside the thumb. Checked thumbs grow larger to host check icons or custom icons, representing state indicators.
                      </p>

                      {/* Interactive Switch Demos */}
                      <div className="flex flex-col gap-4 bg-[var(--m3-surface-variant)] p-4 rounded-[20px]">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">Standard Switch</span>
                            <span className="text-xs text-[var(--m3-on-surface-variant)]">Plain thumb, no icon</span>
                          </div>
                          <M3Switch checked={switch1} onChange={setSwitch1} />
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--m3-outline-variant)] pt-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold flex items-center gap-1.5">
                              Switch with Icon <span className="text-[10px] font-bold text-[var(--m3-primary)] px-1.5 py-0.5 rounded-full bg-[var(--m3-primary-container)]">Requested</span>
                            </span>
                            <span className="text-xs text-[var(--m3-on-surface-variant)]">Thumb displays custom check/cross icons</span>
                          </div>
                          <M3Switch checked={switch2} onChange={setSwitch2} showIcons={true} />
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--m3-outline-variant)] pt-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">Theme Switcher Switch</span>
                            <span className="text-xs text-[var(--m3-on-surface-variant)]">Hosts custom Sun/Moon SVG icons</span>
                          </div>
                          <M3Switch
                            checked={switchTheme}
                            onChange={(val) => {
                              setSwitchTheme(val);
                              setIsDark(val);
                            }}
                            customIcons={{
                              checked: <Moon className="h-3.5 w-3.5 stroke-[2.5]" />,
                              unchecked: <Sun className="h-3.5 w-3.5 stroke-[2.5]" />,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between border-t border-[var(--m3-outline-variant)] pt-3 opacity-60">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">Disabled Switch</span>
                            <span className="text-xs text-[var(--m3-on-surface-variant)]">Switch disabled state in unselected / selected mode</span>
                          </div>
                          <div className="flex gap-2">
                            <M3Switch checked={false} onChange={() => {}} disabled={true} />
                            <M3Switch checked={true} onChange={() => {}} disabled={true} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--m3-outline-variant)] flex justify-between text-[10px] font-mono text-[var(--m3-on-surface-variant)]">
                      <span>Tracks state change</span>
                      <span className="font-bold">
                        Sw1: {switch1 ? "ON" : "OFF"} | Sw2: {switch2 ? "ON" : "OFF"}
                      </span>
                    </div>
                  </M3Card>

                  {/* CHIPS WORKBENCH */}
                  <M3Card variant="outlined" className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--m3-primary)] uppercase tracking-wider mb-4">
                        Material Chips
                      </h4>
                      <p className="text-xs text-[var(--m3-on-surface-variant)] mb-4">
                        Chips are compact, interactive elements representing attributes or entities. Material 3 defines four core designs with 8px rounded contours.
                      </p>

                      <div className="flex flex-col gap-4">
                        {/* 1. Filter Chips */}
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                            Filter Chips (Selectable checkmark):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <M3Chip
                              label="Open Now"
                              variant="filter"
                              selected={selectedChips.includes("filter-1")}
                              onClick={() => handleChipClick("filter-1")}
                            />
                            <M3Chip
                              label="Top Rated"
                              variant="filter"
                              selected={selectedChips.includes("filter-2")}
                              onClick={() => handleChipClick("filter-2")}
                            />
                            <M3Chip
                              label="Under $20"
                              variant="filter"
                              selected={selectedChips.includes("filter-3")}
                              onClick={() => handleChipClick("filter-3")}
                            />
                          </div>
                        </div>

                        {/* 2. Input Chips */}
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                            Input Chips (Removable tags):
                          </span>
                          <div className="flex flex-wrap gap-2 min-h-8">
                            {inputChips.length === 0 ? (
                              <span className="text-[11px] italic text-[var(--m3-on-surface-variant)] opacity-70">
                                All chips removed. Click segment to reload.
                              </span>
                            ) : (
                              inputChips.map((chip) => (
                                <M3Chip
                                  key={chip}
                                  label={chip}
                                  variant="input"
                                  onRemove={() => handleRemoveInputChip(chip)}
                                />
                              ))
                            )}
                          </div>
                        </div>

                        {/* 3. Assist / Suggestion Chips */}
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                            Assist & Suggestion Chips (Buttons):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <M3Chip
                              label="Share Document"
                              variant="assist"
                              icon={<Mail className="h-3.5 w-3.5" />}
                              onClick={() => alert("Assist action: Shared!")}
                            />
                            <M3Chip
                              label="Add Calendar"
                              variant="assist"
                              icon={<Plus className="h-3.5 w-3.5" />}
                              onClick={() => alert("Assist action: Added to calendar!")}
                            />
                            <M3Chip label="Reply 'Understood'" variant="suggestion" onClick={() => {}} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--m3-outline-variant)] flex justify-between text-[10px] font-mono text-[var(--m3-on-surface-variant)]">
                      <span>Chip Action Bench</span>
                      <button
                        onClick={() => setInputChips(["Material 3", "Material You", "Design Tokens"])}
                        className="text-[var(--m3-primary)] hover:underline"
                      >
                        Reset Tags
                      </button>
                    </div>
                  </M3Card>
                </div>

                {/* SEGMENTED BUTTON DEMO */}
                <M3Card variant="outlined" className="mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                      Segmented Buttons
                    </h4>
                    
                    {/* Selector for style variant */}
                    <div className="flex gap-1 bg-[var(--m3-surface-variant)] p-0.5 rounded-full border border-[var(--m3-outline-variant)] text-[11px] self-start">
                      <button
                        type="button"
                        onClick={() => setSegmentedStyleVariant("modern")}
                        className={`px-3 py-1 rounded-full font-medium transition-colors duration-150 ${
                          segmentedStyleVariant === "modern"
                            ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm"
                            : "text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]"
                        }`}
                      >
                        M3 Pill (Image)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSegmentedStyleVariant("standard")}
                        className={`px-3 py-1 rounded-full font-medium transition-colors duration-150 ${
                          segmentedStyleVariant === "standard"
                            ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm"
                            : "text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]"
                        }`}
                      >
                        Classic Outlined
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-[var(--m3-on-surface-variant)] mb-4">
                    Segmented buttons are interactive selectors. M3 supports single-select options (switching views) and multi-select filters. Toggle <strong>M3 Pill (Image)</strong> for the rounded, spaced design.
                  </p>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[var(--m3-surface-variant)] p-4 rounded-[20px]">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                        Single Select (View modes):
                      </span>
                      <M3SegmentedButton
                        options={[
                          { value: "phone", label: "Phone", icon: <Smartphone className="h-4 w-4" /> },
                          { value: "tablet", label: "Tablet", icon: <Smartphone className="rotate-90 h-4 w-4" /> },
                          { value: "laptop", label: "Laptop", icon: <Smartphone className="h-4 w-4" /> },
                        ]}
                        selectedValue={selectedSegmentSingle}
                        onChange={handleSegmentSingleChange}
                        variant={segmentedStyleVariant}
                      />
                      <span className="text-[11px] font-mono opacity-70">
                        Selected: <span className="font-bold">{selectedSegmentSingle}</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                        Multi-Select (Features toggle):
                      </span>
                      <M3SegmentedButton
                        options={[
                          { value: "wifi", label: "Wi-Fi" },
                          { value: "bluetooth", label: "Bluetooth" },
                          { value: "cellular", label: "Cellular" },
                        ]}
                        selectedValue={selectedSegmentMulti}
                        onChange={handleSegmentMultiChange}
                        multiSelect={true}
                        variant={segmentedStyleVariant}
                      />
                      <span className="text-[11px] font-mono opacity-70">
                        Selected: <span className="font-bold">[{selectedSegmentMulti.join(", ")}]</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)] flex items-center gap-1">
                        Image Spec Ref (Cup Sizes):
                      </span>
                      <M3SegmentedButton
                        options={[
                          { value: "8oz", label: "8 oz" },
                          { value: "12oz", label: "12 oz" },
                          { value: "16oz", label: "16 oz" },
                        ]}
                        selectedValue={selectedSize}
                        onChange={(val) => setSelectedSize(val)}
                        variant={segmentedStyleVariant}
                      />
                      <span className="text-[11px] font-mono opacity-70">
                        Selected: <span className="font-bold">{selectedSize === "8oz" ? "8 oz" : selectedSize === "12oz" ? "12 oz" : "16 oz"}</span>
                      </span>
                    </div>
                  </div>
                </M3Card>
              </div>

              {/* 2. BUTTON WORKBENCH (6 VARIANT BUTTON SHOWCASE) */}
              <div className="flex flex-col gap-4 border-b border-[var(--m3-outline-variant)] pb-8">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-[var(--m3-on-surface)]">
                    Material 3 Buttons & FABs
                  </h3>
                  <p className="text-sm text-[var(--m3-on-surface-variant)]">
                    Button states: Hover, Focus, Pressed, and Disabled. M3 floating action buttons use 16px soft-rect angles.
                  </p>
                </div>

                <M3Card variant="outlined">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* BUTTON LIST */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                      <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                        Button Styles
                      </span>
                      <div className="flex flex-wrap gap-3 items-center">
                        <M3Button variant="filled" onClick={() => setClickCount(clickCount + 1)}>
                          Filled Button
                        </M3Button>
                        <M3Button variant="tonal" onClick={() => setClickCount(clickCount + 1)}>
                          Tonal Button
                        </M3Button>
                        <M3Button variant="elevated" onClick={() => setClickCount(clickCount + 1)}>
                          Elevated Button
                        </M3Button>
                        <M3Button variant="outlined" onClick={() => setClickCount(clickCount + 1)}>
                          Outlined Button
                        </M3Button>
                        <M3Button variant="text" onClick={() => setClickCount(clickCount + 1)}>
                          Text Button
                        </M3Button>
                      </div>

                      <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider mt-2">
                        Buttons with Icons & Badges
                      </span>
                      <div className="flex flex-wrap gap-3 items-center">
                        <M3Button
                          variant="filled"
                          icon={<Heart className="h-4 w-4 fill-current" />}
                          onClick={() => setClickCount(clickCount + 1)}
                        >
                          Like Activity
                        </M3Button>
                        <M3Button
                          variant="outlined"
                          icon={<Search className="h-4 w-4" />}
                          onClick={() => setClickCount(clickCount + 1)}
                        >
                          Search Directory
                        </M3Button>
                        <M3Button
                          variant="text"
                          icon={<Code className="h-4 w-4" />}
                          onClick={() => setClickCount(clickCount + 1)}
                        >
                          Source Code
                        </M3Button>
                        <M3Button variant="filled" disabled={true}>
                          Disabled Button
                        </M3Button>
                      </div>
                    </div>

                    {/* FABS SIDE COLUMN */}
                    <div className="flex flex-col gap-4 bg-[var(--m3-surface-variant)] p-4 rounded-[20px] justify-between">
                      <div>
                        <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider block mb-2">
                          Floating Action Buttons
                        </span>
                        <p className="text-[11px] text-[var(--m3-on-surface-variant)] mb-4">
                          FABs trigger high-focus actions. They float at elevation 3 and utilize `rounded-[16px]` (not pill shape).
                        </p>
                        <div className="flex gap-4 items-center flex-wrap">
                          {/* Standard FAB */}
                          <div className="flex flex-col items-center gap-1">
                            <M3Button variant="fab" icon={<Plus className="h-6 w-6 stroke-[2.5]" />} aria-label="Add item" />
                            <span className="text-[10px] font-mono text-[var(--m3-on-surface-variant)]">FAB</span>
                          </div>

                          {/* Extended FAB */}
                          <div className="flex flex-col items-center gap-1">
                            <M3Button
                              variant="extendedFab"
                              icon={<Play className="h-5 w-5 fill-current" />}
                              onClick={() => alert("Extended FAB Clicked")}
                            >
                              Start Slideshow
                            </M3Button>
                            <span className="text-[10px] font-mono text-[var(--m3-on-surface-variant)]">Extended FAB</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[var(--m3-outline-variant)] flex items-center justify-between text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                        <span>Click Actions Tracked:</span>
                        <span className="font-mono bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] px-2 py-0.5 rounded-full text-xs">
                          {clickCount} Clicks
                        </span>
                      </div>
                    </div>
                  </div>
                </M3Card>
              </div>

              {/* 3. INPUTS WORKBENCH (TEXT FIELDS IN ACTIVE/FOCUS/ERROR STATES) */}
              <div className="flex flex-col gap-4 border-b border-[var(--m3-outline-variant)] pb-8">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-[var(--m3-on-surface)]">
                    Text Fields & Inputs
                  </h3>
                  <p className="text-sm text-[var(--m3-on-surface-variant)]">
                    M3 inputs support active borders, floating labels, leading/trailing icons, and validation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OUTLINED FIELD WORKBENCH */}
                  <M3Card variant="outlined">
                    <h4 className="text-sm font-bold text-[var(--m3-primary)] uppercase tracking-wider mb-4">
                      Outlined Text Field
                    </h4>
                    <div className="flex flex-col gap-4">
                      <M3TextField
                        label="First Name"
                        value={textFieldOutlined}
                        onChange={setTextFieldOutlined}
                        helperText="Required fields are marked, enter your name."
                        variant="outlined"
                      />

                      <M3TextField
                        label="Search Catalog"
                        value={textFieldWithIcon}
                        onChange={setTextFieldWithIcon}
                        leadingIcon={<Search className="h-4 w-4" />}
                        helperText="Includes leading vector icons"
                        variant="outlined"
                      />

                      <M3TextField
                        label="Email Address"
                        value="seherkilic6446@gmail.com"
                        onChange={() => {}}
                        disabled={true}
                        helperText="Disabled text fields lock editing"
                        variant="outlined"
                      />
                    </div>
                  </M3Card>

                  {/* FILLED FIELD WORKBENCH */}
                  <M3Card variant="outlined">
                    <h4 className="text-sm font-bold text-[var(--m3-primary)] uppercase tracking-wider mb-4">
                      Filled Text Field
                    </h4>
                    <div className="flex flex-col gap-4">
                      <M3TextField
                        label="Middle Name"
                        value={textFieldFilled}
                        onChange={setTextFieldFilled}
                        helperText="Filled fields sit on tinted surface blocks"
                        variant="filled"
                      />

                      <M3TextField
                        label="Error Field"
                        value={textFieldError}
                        onChange={setTextFieldError}
                        error={textFieldError.length === 0 ? "Format check failed" : undefined}
                        helperText="Errors trigger red alerts automatically"
                        variant="filled"
                      />

                      <M3TextField
                        label="Constant Profile ID"
                        value="M3-7849-SCHEME"
                        onChange={() => {}}
                        disabled={true}
                        helperText="Disabled filled style"
                        variant="filled"
                      />
                    </div>
                  </M3Card>
                </div>
              </div>

              {/* 4. SLIDERS, DIALOGS & OVERLAYS */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-xl font-bold text-[var(--m3-on-surface)]">
                    Feedback, Sliders & Dialog Overlays
                  </h3>
                  <p className="text-sm text-[var(--m3-on-surface-variant)]">
                    Interact with fluid sliding animations and full-frame modal prompts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SLIDERS BOX */}
                  <M3Card variant="outlined" className="flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <h4 className="text-sm font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                          Sliders Workbench
                        </h4>
                        
                        {/* Selector for style variant */}
                        <div className="flex gap-1 bg-[var(--m3-surface-variant)] p-0.5 rounded-full border border-[var(--m3-outline-variant)] text-[11px] self-start">
                          <button
                            type="button"
                            onClick={() => setSliderStyleVariant("modern")}
                            className={`px-3 py-1 rounded-full font-medium transition-colors duration-150 ${
                              sliderStyleVariant === "modern"
                                ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm"
                                : "text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]"
                            }`}
                          >
                            M3 Thick
                          </button>
                          <button
                            type="button"
                            onClick={() => setSliderStyleVariant("standard")}
                            className={`px-3 py-1 rounded-full font-medium transition-colors duration-150 ${
                              sliderStyleVariant === "standard"
                                ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-sm"
                                : "text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]"
                            }`}
                          >
                            Classic
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-[var(--m3-on-surface-variant)] mb-4">
                        Continuous sliders capture generic values, while discrete sliders align to fixed step ticks. Toggle the switcher above to see <strong>M3 Thick</strong> versus <strong>Classic</strong> style.
                      </p>

                      <div className="flex flex-col gap-4 bg-[var(--m3-surface-variant)] p-4 rounded-[20px]">
                        <M3Slider
                          label="Continuous Volume Control"
                          value={sliderContinuous}
                          onChange={setSliderContinuous}
                          min={0}
                          max={100}
                          variant={sliderStyleVariant}
                        />

                        <M3Slider
                          label="Discrete Quality Rating"
                          value={sliderDiscrete}
                          onChange={setSliderDiscrete}
                          min={1}
                          max={5}
                          step={1}
                          discrete={true}
                          variant={sliderStyleVariant}
                        />
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--m3-outline-variant)] flex justify-between text-[10px] font-mono text-[var(--m3-on-surface-variant)]">
                      <span>Live Values:</span>
                      <span>Vol: {sliderContinuous}% | Stars: {sliderDiscrete}/5 | Style: {sliderStyleVariant.toUpperCase()}</span>
                    </div>
                  </M3Card>

                  {/* MODALS TRIGGER */}
                  <M3Card variant="outlined" className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text(--m3-primary) uppercase tracking-wider mb-2">
                        Modal Dialog Prompts
                      </h4>
                      <p className="text-xs text-[var(--m3-on-surface-variant)] mb-4">
                        Material 3 dialogs feature left-aligned content headings, supportive primary action triggers on the bottom right, and a soft background blur to isolate focus layers.
                      </p>

                      <div className="flex flex-col items-center justify-center p-6 bg-[var(--m3-surface-variant)] rounded-[20px] text-center">
                        <Sliders className="h-10 w-10 text-[var(--m3-primary)] mb-2" />
                        <span className="text-sm font-semibold mb-3">Launch System Alert</span>
                        <M3Button
                          variant="filled"
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Trigger Dialog
                        </M3Button>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[var(--m3-outline-variant)] text-[10px] font-mono text-[var(--m3-on-surface-variant)] text-center">
                      Click button to inspect the overlay
                    </div>
                  </M3Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: MATERIAL 3 LOADING SHOWCASE */}
          {activeTab === "loading" && (
            <M3LoadingIndicatorsShowcase />
          )}

          {/* TAB CONTENT: GBOARD VIRTUAL KEYBOARD SHOWCASE */}
          {activeTab === "keyboard" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              {/* Introduction Card */}
              <M3Card variant="elevated" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-[var(--m3-primary)] rounded-full blur-[100px] opacity-15 pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]">
                    <Keyboard className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-[var(--m3-on-surface)]">
                    Material 3 Gboard Virtual Keyboard
                  </h2>
                  <p className="text-sm text-[var(--m3-on-surface-variant)] leading-relaxed">
                    This is a pixel-perfect, high-fidelity replica of the Android Gboard virtual keyboard built using Material 3 design specs. 
                    It supports standard alphanumeric keys, layout shift/caps-lock toggling, symbols mode, an emoji drawer, predictive suggestions, sound feedback, and live document/input focus binding.
                  </p>

                  {/* Settings toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 bg-[var(--m3-surface-container)] rounded-[20px] border border-[var(--m3-outline-variant)]">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col pr-4">
                        <span className="text-sm font-semibold text-[var(--m3-on-surface)]">
                          Global System Keyboard (IME)
                        </span>
                        <span className="text-xs text-[var(--m3-on-surface-variant)]">
                          Enable Gboard globally for all input fields across this app!
                        </span>
                      </div>
                      <M3Switch
                        checked={globalKeyboardEnabled}
                        onChange={(val) => {
                          setGlobalKeyboardEnabled(val);
                          setIsGlobalKeyboardOpen(val);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col pr-4">
                        <span className="text-sm font-semibold text-[var(--m3-on-surface)]">
                          Global Keyboard Popup Status
                        </span>
                        <span className="text-xs text-[var(--m3-on-surface-variant)]">
                          {globalKeyboardEnabled ? "Visible as popup at the bottom" : "Enable Global System Keyboard first"}
                        </span>
                      </div>
                      <M3Switch
                        checked={isGlobalKeyboardOpen}
                        onChange={(val) => setIsGlobalKeyboardOpen(val)}
                        disabled={!globalKeyboardEnabled}
                      />
                    </div>
                  </div>
                </div>
              </M3Card>

              {/* Chat Simulator Sandbox Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chat Log column */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <M3Card variant="outlined" className="flex flex-col h-[480px] justify-between overflow-hidden">
                    {/* Sandbox Header */}
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--m3-outline-variant)]">
                      <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                        M3 Android Chat Sandbox
                      </span>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 my-2 scrollbar-thin">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col max-w-[85%] rounded-[20px] p-3 text-sm transition-all
                            ${
                              msg.sender === "user"
                                ? "self-end bg-[var(--m3-primary)] text-[var(--m3-on-primary)] rounded-tr-none"
                                : "self-start bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface)] rounded-tl-none border border-[var(--m3-outline-variant)] border-opacity-30"
                            }`}
                        >
                          <span className="text-[10px] font-semibold uppercase opacity-60 mb-0.5">
                            {msg.sender === "user" ? "You" : "Gboard Bot"}
                          </span>
                          <span className="leading-relaxed whitespace-pre-wrap text-xs">{msg.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chat Sandbox Input field */}
                    <div className="pt-3 border-t border-[var(--m3-outline-variant)] flex gap-2 items-end">
                      <M3TextField
                        id="m3-chat-input"
                        label="Type a message..."
                        value={chatInput}
                        onChange={(val) => setChatInput(val)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // Trigger enter send
                            const val = chatInput.trim();
                            if (val) {
                              setChatMessages(prev => [...prev, { sender: "user", text: val }]);
                              setChatInput("");
                              // Sim response
                              setTimeout(() => {
                                setChatMessages(prev => [
                                  ...prev,
                                  { sender: "bot", text: `I received your message: "${val}"!\nYour typing is working beautifully on the Gboard replica.` }
                                ]);
                              }, 1000);
                            }
                          }
                        }}
                        className="flex-1"
                      />
                      <M3Button
                        variant="filled"
                        className="h-14 w-14 shrink-0 rounded-[16px] flex items-center justify-center p-0"
                        onClick={() => {
                          const val = chatInput.trim();
                          if (val) {
                            setChatMessages(prev => [...prev, { sender: "user", text: val }]);
                            setChatInput("");
                            setTimeout(() => {
                              setChatMessages(prev => [
                                ...prev,
                                { sender: "bot", text: "Gboard is fully interactive and dynamic! Your message is received." }
                              ]);
                            }, 1000);
                          }
                        }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </M3Button>
                    </div>
                  </M3Card>
                </div>

                {/* Inline Keyboard Preview column */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <M3Card variant="outlined" className="flex flex-col justify-between p-4 bg-[var(--m3-surface-container-low)]">
                    <div className="flex items-center justify-between mb-3 border-b border-[var(--m3-outline-variant)] pb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider">
                          Inline Keyboard Interactive Module
                        </span>
                        <span className="text-[11px] text-[var(--m3-on-surface-variant)]">
                          Click keys below to input directly into the sandbox above!
                        </span>
                      </div>
                    </div>

                    {/* Inline keyboard binding the sandbox chat input id */}
                    <M3VirtualKeyboard
                      targetInputId="m3-chat-input"
                      onKeyPress={(char) => {
                        // Let React keep state synced
                        const el = document.getElementById("m3-chat-input") as HTMLInputElement | null;
                        if (el) {
                          setChatInput(el.value);
                        }
                      }}
                      onBackspace={() => {
                        const el = document.getElementById("m3-chat-input") as HTMLInputElement | null;
                        if (el) {
                          setChatInput(el.value);
                        }
                      }}
                      onEnter={() => {
                        // Submit message
                        const el = document.getElementById("m3-chat-input") as HTMLInputElement | null;
                        if (el) {
                          const val = el.value.trim();
                          if (val) {
                            setChatMessages(prev => [...prev, { sender: "user", text: val }]);
                            setChatInput("");
                            el.value = "";
                            setTimeout(() => {
                              setChatMessages(prev => [
                                ...prev,
                                { sender: "bot", text: "Nice typing on Gboard!" }
                              ]);
                            }, 1000);
                          }
                        }
                      }}
                    />

                    <div className="mt-4 pt-3 border-t border-[var(--m3-outline-variant)] text-[10px] font-mono text-[var(--m3-on-surface-variant)] flex justify-between">
                      <span>Tap keys above to test different layouts (123 / Smiley Drawer)</span>
                      <span className="text-[var(--m3-primary)] font-bold">M3 GBOARD V1.0</span>
                    </div>
                  </M3Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2.5 FULL DOWN TEST BED */}
          {activeTab === "fulldowntest" && (
            <div className="flex flex-col gap-8">
              {/* Educational Intro Hero Card */}
              <M3Card variant="elevated" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-[var(--m3-primary)] rounded-full blur-[100px] opacity-15 pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)]">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-[var(--m3-on-surface)]">
                    Full Down & Selection Test Bed
                  </h2>
                  <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed max-w-2xl">
                    Welcome to the ultimate Material 3 validation playground! Here, you can test "Pull-Down" Dropdown selectors, enhanced <strong>SwitchWithIcons</strong> states, and <strong>others</strong> like Checkboxes and Radio lists in real time.
                  </p>
                </div>
              </M3Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. THE DROP-DOWNS WORKSPACE (PULL-DOWNS) */}
                <M3Card variant="outlined" className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--m3-primary)] mb-1">
                      1. Pull-Down Dropdown Selects
                    </h3>
                    <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed mb-4">
                      Material 3 Select elements use custom overlays that support leading/trailing vector indicators, checkmarks, hover overlays, and disabled locks.
                    </p>
                  </div>

                  <div className="flex flex-col gap-5 bg-[var(--m3-surface-variant)] p-4 rounded-[20px]">
                    {/* Outlined Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                        Outlined Dropdown Variant:
                      </span>
                      <M3Dropdown
                        label="Active Device Interface"
                        selectedValue={dropdownOutlined}
                        onChange={setDropdownOutlined}
                        options={[
                          { value: "phone", label: "Smartphone Mobile", icon: <Smartphone className="h-4 w-4" /> },
                          { value: "tv", label: "Television Screen", icon: <Tv className="h-4 w-4" /> },
                          { value: "system", label: "System Default Panel", icon: <Settings className="h-4 w-4" /> },
                        ]}
                        variant="outlined"
                        helperText="Matches dynamic M3 corner roundness rules."
                      />
                    </div>

                    {/* Filled Dropdown */}
                    <div className="flex flex-col gap-1.5 border-t border-[var(--m3-outline-variant)] pt-4">
                      <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                        Filled Dropdown Variant:
                      </span>
                      <M3Dropdown
                        label="Baseline Colorway Tone"
                        selectedValue={dropdownFilled}
                        onChange={setDropdownFilled}
                        options={[
                          { value: "light", label: "Material Baseline Light", icon: <Sun className="h-4 w-4" /> },
                          { value: "dark", label: "Material Baseline Dark", icon: <Moon className="h-4 w-4" /> },
                          { value: "auto", label: "Dynamic Adaptive Auto", icon: <Sparkles className="h-4 w-4" /> },
                        ]}
                        variant="filled"
                        helperText="Sits on top of tinted background cards."
                      />
                    </div>

                    {/* Disabled Dropdown */}
                    <div className="flex flex-col gap-1.5 border-t border-[var(--m3-outline-variant)] pt-4">
                      <span className="text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                        Disabled Dropdown Block:
                      </span>
                      <M3Dropdown
                        label="Locked Enterprise Access"
                        selectedValue=""
                        onChange={() => {}}
                        options={[]}
                        disabled={true}
                        helperText="Locked and non-interactive."
                      />
                    </div>
                  </div>
                </M3Card>

                {/* 2. THE SWITCHES WITH ICONS (TRACK & THUMB EMBEDDINGS) */}
                <M3Card variant="outlined" className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--m3-primary)] mb-1">
                      2. SwitchWithIcons (Enhanced Toggles)
                    </h3>
                    <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed mb-4">
                      Switches are enhanced in M3 with optional icons inside the thumb. Checked thumbs scale smoothly to draw visual focus to active state indications.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 bg-[var(--m3-surface-variant)] p-4 rounded-[20px]">
                    {/* Volume switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Sound Volume Controller</span>
                        <span className="text-xs text-[var(--m3-on-surface-variant)]">Volume2 / VolumeX</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold opacity-75">
                          {switchVolume ? "Sound On" : "Muted"}
                        </span>
                        <M3Switch
                          checked={switchVolume}
                          onChange={setVolume => setSwitchVolume(setVolume)}
                          customIcons={{
                            checked: <Volume2 className="h-3 w-3 stroke-[2.5]" />,
                            unchecked: <VolumeX className="h-3 w-3 stroke-[2.5]" />,
                          }}
                        />
                      </div>
                    </div>

                    {/* Locker switch */}
                    <div className="flex items-center justify-between border-t border-[var(--m3-outline-variant)] pt-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Security System Lock</span>
                        <span className="text-xs text-[var(--m3-on-surface-variant)]">Lock / Unlock</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold opacity-75">
                          {switchLock ? "Secured" : "Unlocked"}
                        </span>
                        <M3Switch
                          checked={switchLock}
                          onChange={setLock => setSwitchLock(setLock)}
                          customIcons={{
                            checked: <Lock className="h-3 w-3 stroke-[2.5]" />,
                            unchecked: <Unlock className="h-3 w-3 stroke-[2.5]" />,
                          }}
                        />
                      </div>
                    </div>

                    {/* Play Pause switch */}
                    <div className="flex items-center justify-between border-t border-[var(--m3-outline-variant)] pt-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Media Playback State</span>
                        <span className="text-xs text-[var(--m3-on-surface-variant)]">Pause / Play</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold opacity-75">
                          {switchPlay ? "Playing" : "Paused"}
                        </span>
                        <M3Switch
                          checked={switchPlay}
                          onChange={setPlay => setSwitchPlay(setPlay)}
                          customIcons={{
                            checked: <Pause className="h-3 w-3 stroke-[2.5] fill-current" />,
                            unchecked: <Play className="h-3 w-3 stroke-[2.5] fill-current" />,
                          }}
                        />
                      </div>
                    </div>

                    {/* Default Sun/Moon switch */}
                    <div className="flex items-center justify-between border-t border-[var(--m3-outline-variant)] pt-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Day/Night Light-Dark Tone</span>
                        <span className="text-xs text-[var(--m3-on-surface-variant)]">Moon / Sun</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold opacity-75">
                          {isDark ? "Dark Theme" : "Light Theme"}
                        </span>
                        <M3Switch
                          checked={isDark}
                          onChange={setIsDark}
                          customIcons={{
                            checked: <Moon className="h-3 w-3 stroke-[2.5]" />,
                            unchecked: <Sun className="h-3 w-3 stroke-[2.5]" />,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </M3Card>
              </div>

              {/* Bento Row 2: Others (Checkboxes & Radios) and JSON monitor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3. OTHERS: CHECKBOXES & RADIO GROUPS */}
                <M3Card variant="outlined" className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--m3-primary)] mb-1">
                      3. Others (Checkboxes & Radios)
                    </h3>
                    <p className="text-xs text-[var(--m3-on-surface-variant)] leading-relaxed mb-4">
                      Checkboxes manage multi-select options or sub-tasks, and radio buttons manage a single exclusive choice in a list of items.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--m3-surface-variant)] p-4 rounded-[20px]">
                    {/* Checkboxes List */}
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider block mb-1">
                        Task Checkboxes
                      </span>
                      <M3Checkbox
                        label="Deploy to cloud container"
                        checked={checkboxItem1}
                        onChange={setCheckboxItem1}
                      />
                      <M3Checkbox
                        label="Export token scheme to CSS"
                        checked={checkboxItem2}
                        onChange={setCheckboxItem2}
                      />
                      <M3Checkbox
                        label="Dynamic responsive states"
                        checked={checkboxItemIndeterminate}
                        onChange={(val) => setCheckboxItemIndeterminate(val)}
                      />
                      <div className="opacity-50 pointer-events-none mt-1">
                        <M3Checkbox
                          label="Disabled task block"
                          checked={true}
                          onChange={() => {}}
                          disabled={true}
                        />
                      </div>
                    </div>

                    {/* Radio Options List */}
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-bold text-[var(--m3-primary)] uppercase tracking-wider block mb-1">
                        Theme Preference Selection
                      </span>
                      <M3Radio
                        label="Automated dynamic tone"
                        checked={radioSelection === "auto"}
                        onChange={() => setRadioSelection("auto")}
                      />
                      <M3Radio
                        label="Forced static light scheme"
                        checked={radioSelection === "light"}
                        onChange={() => setRadioSelection("light")}
                      />
                      <M3Radio
                        label="Forced static dark scheme"
                        checked={radioSelection === "dark"}
                        onChange={() => setRadioSelection("dark")}
                      />
                      <div className="opacity-50 pointer-events-none mt-1">
                        <M3Radio
                          label="Disabled locked option"
                          checked={false}
                          onChange={() => {}}
                          disabled={true}
                        />
                      </div>
                    </div>
                  </div>
                </M3Card>

                {/* 4. REAL-TIME CONTROLLER MONITOR */}
                <M3Card variant="filled" className="flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-[var(--m3-primary)]" />
                      <h3 className="text-sm font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
                        Dynamic JSON State Monitor
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--m3-on-surface-variant)] leading-normal">
                      Every component in this testbed is bound to interactive React hooks. Toggle buttons above to see instantaneous state changes updated below!
                    </p>

                    {/* Interactive Code Console */}
                    <div className="bg-black bg-opacity-[0.35] p-4 rounded-[16px] font-mono text-[11px] leading-relaxed text-emerald-400 border border-[var(--m3-outline-variant)] border-opacity-20 select-text overflow-x-auto">
                      <span className="text-slate-500">// Real-time Selection state:</span>
                      <pre className="mt-2">
{`{
  "pullDowns": {
    "outlinedSelect": "${dropdownOutlined}",
    "filledSelect": "${dropdownFilled}"
  },
  "switchWithIcons": {
    "volumeController": ${switchVolume},
    "securityLocker": ${switchLock},
    "mediaPlayerState": ${switchPlay}
  },
  "others": {
    "taskCheckbox1": ${checkboxItem1},
    "taskCheckbox2": ${checkboxItem2},
    "taskCheckboxIndeterminate": ${
      checkboxItemIndeterminate === "indeterminate" ? '"indeterminate"' : checkboxItemIndeterminate
    },
    "radioSelection": "${radioSelection}",
    "isDarkThemeApplied": ${isDark}
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--m3-outline-variant)] border-opacity-40 flex justify-between items-center text-[10px] font-mono text-[var(--m3-on-surface-variant)]">
                    <span>Validation State: PASSING</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 fill-current" /> Active Binding
                    </span>
                  </div>
                </M3Card>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. PALETTE EXPLORER */}
          {activeTab === "palette" && (
            <div className="flex flex-col gap-6">
              {/* Educational info on dynamic palettes */}
              <M3Card variant="outlined" className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[var(--m3-primary)]" />
                  <h3 className="text-lg font-bold text-[var(--m3-on-surface)]">
                    Understanding Dynamic Color Scheming
                  </h3>
                </div>
                <p className="text-sm text-[var(--m3-on-surface-variant)] leading-relaxed">
                  In Material 3, colors are not hardcoded. Instead, they are referenced as **tokens** mapped to functional roles.
                  When a user picks a seed color (like you did in the customizer), the system converts it to HSL, keeps the Hue, and constructs 5 specialized tonal ranges:
                </p>
                <ol className="list-decimal pl-5 text-xs text-[var(--m3-on-surface-variant)] flex flex-col gap-1.5 mt-1">
                  <li>**Primary Palette**: Derived directly from the seed hue, creating bright focus accents.</li>
                  <li>**Secondary Palette**: Derived with significantly reduced saturation, forming neutral chips and selection structures.</li>
                  <li>**Tertiary Palette**: Offset by 60 degrees in hue, creating refreshing complementary highlights.</li>
                  <li>**Neutral Palette**: Extracted with extremely low saturation, rendering background canvas slabs.</li>
                  <li>**Neutral Variant Palette**: Extracted with medium saturation to style borders, outlines, and inactive text.</li>
                </ol>
              </M3Card>

              {/* Grid palette view */}
              <PaletteGenerator palette={activePalette} isDark={isDark} />
            </div>
          )}
        </section>
      </main>

      {/* DETACHED BOTTOM M3 SHEET FOOTER */}
      <footer className="w-full mt-auto py-8 bg-[var(--m3-surface-variant)] text-[var(--m3-on-surface-variant)] border-t border-[var(--m3-outline-variant)] transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-[var(--m3-outline)] bg-[var(--m3-primary)]" />
            <span className="text-sm font-semibold text-[var(--m3-on-surface)]">Material 3 Showcase</span>
          </div>
          <p className="text-xs max-w-md leading-relaxed">
            Styled with **Google's Nunito** typeface and built entirely with **Tailwind CSS v4** and **Motion/React** animations. Designed with absolute compliance with Material You guidelines.
          </p>
          <span className="text-[10px] font-mono opacity-50">
            Current session: UTC 2026-07-04 | User Email: seherkilic6446@gmail.com
          </span>
        </div>
      </footer>

      {/* FULL-MODAL DIALOG POPUP */}
      <M3Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Apply New Design Token?"
        supportingText="Confirming this prompt simulates applying a customized system-level colorway token to your application manifest. This updates button outlines, tracks, and slider fill colors instantly."
        icon={<HelpCircle className="h-6 w-6" />}
        confirmLabel="Apply Token"
        onConfirm={() => {
          setClickCount(clickCount + 1);
          alert("Dynamic tokens synced successfully!");
        }}
        cancelLabel="Discard"
      />

      {/* CUSTOM M3 COLOR PICKER DIALOG POPUP */}
      <AnimatePresence>
        {showColorPickerDialog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowColorPickerDialog(false)}
              className="absolute inset-0 bg-neutral-900 bg-opacity-40 backdrop-blur-[2px]"
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative z-10 w-full max-w-sm overflow-hidden"
            >
              <M3ColorPicker
                initialColor={seedColor}
                onChange={(newHex) => {
                  setSeedColor(newHex);
                  setThemeName("Custom Palette");
                }}
                onClose={() => setShowColorPickerDialog(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL FLOATING GBOARD */}
      {globalKeyboardEnabled && (
        <>
          {/* Floating Toggle Button */}
          <button
            onClick={() => setIsGlobalKeyboardOpen(!isGlobalKeyboardOpen)}
            className="fixed bottom-6 right-6 z-40 bg-[var(--m3-primary)] text-[var(--m3-on-primary)] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all h-14 px-5 rounded-[24px] flex items-center gap-2 text-sm font-bold border border-[var(--m3-outline-variant)] cursor-pointer"
            title="Toggle M3 Virtual Keyboard"
          >
            <Keyboard className="h-5 w-5" />
            <span>{isGlobalKeyboardOpen ? "Hide Keyboard" : "Open Keyboard"}</span>
          </button>

          {isGlobalKeyboardOpen && (
            <M3VirtualKeyboard
              isFloating={true}
              onClose={() => setIsGlobalKeyboardOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
