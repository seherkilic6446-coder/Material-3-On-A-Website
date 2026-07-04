import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { M3Button } from "./M3Button";

// Interfaces
export interface HSV {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
  a: number; // 0 - 100
}

interface M3ColorPickerProps {
  initialColor: string; // hex
  onChange: (hex: string) => void;
  onClose?: () => void;
}

// Color conversion helpers
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const hDecimal = h / 360;
  const sDecimal = s / 100;
  const vDecimal = v / 100;

  let r = 0, g = 0, b = 0;

  const i = Math.floor(hDecimal * 6);
  const f = hDecimal * 6 - i;
  const p = vDecimal * (1 - sDecimal);
  const q = vDecimal * (1 - f * sDecimal);
  const t = vDecimal * (1 - (1 - f) * sDecimal);

  switch (i % 6) {
    case 0: r = vDecimal; g = t; b = p; break;
    case 1: r = q; g = vDecimal; b = p; break;
    case 2: r = p; g = vDecimal; b = t; break;
    case 3: r = p; g = q; b = vDecimal; break;
    case 4: r = t; g = p; b = vDecimal; break;
    case 5: r = vDecimal; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rDec = r / 255;
  const gDec = g / 255;
  const bDec = b / 255;

  const max = Math.max(rDec, gDec, bDec);
  const min = Math.min(rDec, gDec, bDec);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rDec) {
      h = ((gDec - bDec) / delta) % 6;
    } else if (max === gDec) {
      h = (bDec - rDec) / delta + 2;
    } else {
      h = (rDec - gDec) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100);
  const v = Math.round(max * 100);

  return { h, s, v };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 3 && cleaned.length !== 6) return null;

  let r = 0, g = 0, b = 0;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16);
    g = parseInt(cleaned[1] + cleaned[1], 16);
    b = parseInt(cleaned[2] + cleaned[2], 16);
  } else {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  }

  return rgbToHsv(r, g, b);
}

export const M3ColorPicker: React.FC<M3ColorPickerProps> = ({
  initialColor,
  onChange,
  onClose
}) => {
  const [hsv, setHsv] = useState<HSV>({ h: 0, s: 100, v: 100, a: 100 });
  const [hexInput, setHexInput] = useState<string>("#FF0000");

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  // Parse initial color
  useEffect(() => {
    const parsed = hexToHsv(initialColor);
    if (parsed) {
      setHsv({ ...parsed, a: 100 });
      setHexInput(initialColor.toUpperCase());
    }
  }, [initialColor]);

  // Synchronize hex text input when HSV state changes
  const updateHsv = (newHsv: HSV) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInput(hex);
  };

  // SV Box Drag Logic
  const handleSvDrag = (clientX: number, clientY: number) => {
    if (!svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    
    updateHsv({
      ...hsv,
      s: Math.round(x * 100),
      v: Math.round((1 - y) * 100)
    });
  };

  const handleSvMouseDown = (e: React.MouseEvent) => {
    handleSvDrag(e.clientX, e.clientY);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleSvDrag(moveEvent.clientX, moveEvent.clientY);
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSvTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSvDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches[0]) {
        handleSvDrag(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Hue Slider Drag Logic
  const handleHueDrag = (clientX: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    updateHsv({
      ...hsv,
      h: Math.round(x * 360)
    });
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    handleHueDrag(e.clientX);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleHueDrag(moveEvent.clientX);
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleHueTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleHueDrag(e.touches[0].clientX);
    }
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches[0]) {
        handleHueDrag(moveEvent.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Alpha Slider Drag Logic
  const handleAlphaDrag = (clientX: number) => {
    if (!alphaRef.current) return;
    const rect = alphaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    updateHsv({
      ...hsv,
      a: Math.round(x * 100)
    });
  };

  const handleAlphaMouseDown = (e: React.MouseEvent) => {
    handleAlphaDrag(e.clientX);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleAlphaDrag(moveEvent.clientX);
    };
    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleAlphaTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleAlphaDrag(e.touches[0].clientX);
    }
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches[0]) {
        handleAlphaDrag(moveEvent.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  };

  // Text inputs handlers
  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    const parsed = hexToHsv(val);
    if (parsed) {
      setHsv({ ...parsed, a: hsv.a });
    }
  };

  const handleNumericHsvChange = (key: keyof HSV, val: number) => {
    let clampedVal = val;
    if (key === "h") clampedVal = Math.max(0, Math.min(360, val));
    if (key === "s" || key === "v" || key === "a") clampedVal = Math.max(0, Math.min(100, val));
    
    const nextHsv = { ...hsv, [key]: clampedVal };
    updateHsv(nextHsv);
  };

  const currentSolidHex = hsvToHex(hsv.h, hsv.s, hsv.v);
  const rgbPureHue = hsvToHex(hsv.h, 100, 100);

  // Transparent checkerboard CSS pattern
  const checkerboardStyle = {
    backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                      linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #ccc 75%), 
                      linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
    backgroundSize: '12px 12px',
    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
  };

  const onSelectClick = () => {
    onChange(currentSolidHex);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-[var(--m3-surface)] border border-[var(--m3-outline-variant)] shadow-2xl rounded-[24px] p-6 text-[var(--m3-on-surface)] select-none">
      {/* Header section with optional close and preview swatch */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-[var(--m3-on-surface)] tracking-wide">
          Color picker
        </span>
        <div className="flex items-center gap-3">
          {/* Swatch color display box */}
          <div 
            className="w-16 h-6 rounded-full border border-[var(--m3-outline-variant)] shadow-inner"
            style={{ 
              backgroundColor: currentSolidHex,
              opacity: hsv.a / 100 
            }}
          />
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-1 rounded-full hover:bg-[var(--m3-on-surface-variant)] hover:bg-opacity-10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2D SV Saturation-Value Canvas */}
      <div 
        ref={svRef}
        onMouseDown={handleSvMouseDown}
        onTouchStart={handleSvTouchStart}
        className="relative w-full h-44 rounded-2xl cursor-crosshair overflow-hidden border border-[var(--m3-outline-variant)]"
        style={{ backgroundColor: rgbPureHue }}
      >
        {/* Saturation White to Transparent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        {/* Value Black to Transparent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

        {/* Circular Pointer Handle */}
        <div 
          className="absolute h-5 w-5 rounded-full border-2 border-white shadow-lg pointer-events-none -translate-x-1/2 translate-y-1/2"
          style={{ 
            left: `${hsv.s}%`, 
            bottom: `${hsv.v}%`,
            backgroundColor: currentSolidHex,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)" 
          }}
        />
      </div>

      {/* Hue Slider (H) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
          <span>Hue</span>
          <span>{hsv.h}°</span>
        </div>
        <div 
          ref={hueRef}
          onMouseDown={handleHueMouseDown}
          onTouchStart={handleHueTouchStart}
          className="relative w-full h-4 rounded-full cursor-pointer"
          style={{ 
            background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" 
          }}
        >
          {/* Handle */}
          <div 
            className="absolute h-5 w-5 rounded-full bg-white border border-neutral-300 shadow-md top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ 
              left: `${(hsv.h / 360) * 100}%`,
              backgroundColor: hsvToHex(hsv.h, 100, 100)
            }}
          />
        </div>
      </div>

      {/* Alpha Slider (A) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
          <span>Alpha (Opacity)</span>
          <span>{hsv.a}%</span>
        </div>
        <div className="relative w-full h-4 rounded-full overflow-hidden border border-[var(--m3-outline-variant)] border-opacity-35" style={checkerboardStyle}>
          <div 
            ref={alphaRef}
            onMouseDown={handleAlphaMouseDown}
            onTouchStart={handleAlphaTouchStart}
            className="absolute inset-0 cursor-pointer"
            style={{ 
              background: `linear-gradient(to right, transparent, ${currentSolidHex})` 
            }}
          />
          {/* Handle */}
          <div 
            className="absolute h-5 w-5 rounded-full bg-white border border-neutral-300 shadow-md top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
            style={{ 
              left: `${hsv.a}%`
            }}
          />
        </div>
      </div>

      {/* HSVA Numeric textboxes */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { label: "H", value: hsv.h, max: 360, key: "h" as const },
          { label: "S", value: hsv.s, max: 100, key: "s" as const },
          { label: "V", value: hsv.v, max: 100, key: "v" as const },
          { label: "A", value: hsv.a, max: 100, key: "a" as const }
        ].map((item) => (
          <div key={item.key} className="flex flex-col items-center gap-1">
            <input 
              type="number"
              min="0"
              max={item.max}
              value={item.value}
              onChange={(e) => handleNumericHsvChange(item.key, parseInt(e.target.value) || 0)}
              className="w-full text-center bg-[var(--m3-surface-variant)] border border-[var(--m3-outline)] rounded-xl py-2 font-semibold font-mono text-sm text-[var(--m3-on-surface)] focus:border-2 focus:border-[var(--m3-primary)] outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] font-bold text-[var(--m3-on-surface-variant)]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Hex Input box */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold text-[var(--m3-on-surface-variant)] uppercase tracking-wider">
          Hex Code
        </label>
        <input 
          type="text"
          value={hexInput}
          onChange={(e) => handleHexInputChange(e.target.value)}
          placeholder="#FFFFFF"
          className="w-full bg-[var(--m3-surface-variant)] border border-[var(--m3-outline)] rounded-xl py-2 px-4 font-semibold font-mono text-sm text-[var(--m3-on-surface)] focus:border-2 focus:border-[var(--m3-primary)] outline-none transition-all uppercase"
        />
      </div>

      {/* Footer / Confirmation button */}
      <div className="flex justify-end gap-2 pt-2 border-t border-[var(--m3-outline-variant)] border-opacity-35">
        <M3Button variant="filled" onClick={onSelectClick} className="px-6 rounded-full">
          Select
        </M3Button>
      </div>
    </div>
  );
};
