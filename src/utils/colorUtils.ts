import { M3Palette } from "../types";

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Clean hex string
  let cleanHex = hex.replace(/^#/, "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  
  if (cleanHex.length !== 6) {
    // Fallback to blue-ish primary
    return { h: 262, s: 50, l: 40 };
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  // Clamp values
  const clampedH = ((h % 360) + 360) % 360;
  const clampedS = Math.max(0, Math.min(100, s)) / 100;
  const clampedL = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * clampedL - 1)) * clampedS;
  const x = c * (1 - Math.abs(((clampedH / 60) % 2) - 1));
  const m = clampedL - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= clampedH && clampedH < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= clampedH && clampedH < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= clampedH && clampedH < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= clampedH && clampedH < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= clampedH && clampedH < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= clampedH && clampedH < 360) {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, "0");
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, "0");
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Generates an M3Palette for a specific lighting mode based on seed HSL.
 * Tone values represent perceptual lightness (0 to 100).
 */
function createM3PaletteFromHsl(h: number, s: number, isDark: boolean): M3Palette {
  // Map standard Material 3 color tones (roughly corresponding to Lightness % in custom formula)
  // Under standard HSL, lightness serves as a robust approximation of the tone scale.
  const t = {
    10: 10,
    20: 15,
    30: 25,
    40: 38,
    50: 50,
    60: 62,
    80: 80,
    90: 92,
    95: 96,
    98: 98,
    99: 99,
    100: 100,
  };

  // 1. Primary Hue & Saturation
  const primH = h;
  const primS = Math.max(35, Math.min(85, s)); // keep Primary colorful

  // 2. Secondary (usually desaturated version of primary)
  const secH = h;
  const secS = Math.max(12, Math.min(24, s * 0.35));

  // 3. Tertiary (shifted hue, slightly more vibrant than secondary)
  const tertH = (h + 60) % 360;
  const tertS = Math.max(16, Math.min(40, s * 0.5));

  // 4. Neutrals (extreme desaturation)
  const neutH = h;
  const neutS = Math.max(4, Math.min(8, s * 0.08));

  // 5. Neutral Variants (medium desaturation)
  const neutVarH = h;
  const neutVarS = Math.max(6, Math.min(12, s * 0.12));

  // 6. Error (standardized crimson red hue)
  const errH = 4;
  const errS = 85;

  if (!isDark) {
    // --- LIGHT MODE PALETTE ---
    return {
      primary: hslToHex(primH, primS, t[40]),
      onPrimary: hslToHex(primH, primS, t[100]),
      primaryContainer: hslToHex(primH, primS, t[90]),
      onPrimaryContainer: hslToHex(primH, primS, t[10]),

      secondary: hslToHex(secH, secS, t[40]),
      onSecondary: hslToHex(secH, secS, t[100]),
      secondaryContainer: hslToHex(secH, secS, t[90]),
      onSecondaryContainer: hslToHex(secH, secS, t[10]),

      tertiary: hslToHex(tertH, tertS, t[40]),
      onTertiary: hslToHex(tertH, tertS, t[100]),
      tertiaryContainer: hslToHex(tertH, tertS, t[90]),
      onTertiaryContainer: hslToHex(tertH, tertS, t[10]),

      error: hslToHex(errH, errS, t[40]),
      onError: hslToHex(errH, errS, t[100]),
      errorContainer: hslToHex(errH, errS, t[90]),
      onErrorContainer: hslToHex(errH, errS, t[10]),

      background: hslToHex(neutH, neutS, t[98]),
      onBackground: hslToHex(neutH, neutS, t[10]),

      surface: hslToHex(neutH, neutS, t[98]),
      onSurface: hslToHex(neutH, neutS, t[10]),
      surfaceVariant: hslToHex(neutVarH, neutVarS, t[90]),
      onSurfaceVariant: hslToHex(neutVarH, neutVarS, t[30]),

      outline: hslToHex(neutVarH, neutVarS, t[50]),
      outlineVariant: hslToHex(neutVarH, neutVarS, t[80]),
      shadow: "#000000",
    };
  } else {
    // --- DARK MODE PALETTE ---
    return {
      primary: hslToHex(primH, primS, t[80]),
      onPrimary: hslToHex(primH, primS, t[20]),
      primaryContainer: hslToHex(primH, primS, t[30]),
      onPrimaryContainer: hslToHex(primH, primS, t[90]),

      secondary: hslToHex(secH, secS, t[80]),
      onSecondary: hslToHex(secH, secS, t[20]),
      secondaryContainer: hslToHex(secH, secS, t[30]),
      onSecondaryContainer: hslToHex(secH, secS, t[90]),

      tertiary: hslToHex(tertH, tertS, t[80]),
      onTertiary: hslToHex(tertH, tertS, t[20]),
      tertiaryContainer: hslToHex(tertH, tertS, t[30]),
      onTertiaryContainer: hslToHex(tertH, tertS, t[90]),

      error: hslToHex(errH, errS, t[80]),
      onError: hslToHex(errH, errS, t[20]),
      errorContainer: hslToHex(errH, errS, t[30]),
      onErrorContainer: hslToHex(errH, errS, t[90]),

      background: hslToHex(neutH, neutS, t[10]),
      onBackground: hslToHex(neutH, neutS, t[90]),

      surface: hslToHex(neutH, neutS, t[10]),
      onSurface: hslToHex(neutH, neutS, t[90]),
      surfaceVariant: hslToHex(neutVarH, neutVarS, t[30]),
      onSurfaceVariant: hslToHex(neutVarH, neutVarS, t[80]),

      outline: hslToHex(neutVarH, neutVarS, t[60]),
      outlineVariant: hslToHex(neutVarH, neutVarS, t[30]),
      shadow: "#000000",
    };
  }
}

export function generateM3ThemeFromSeed(hex: string, name: string): {
  name: string;
  seedHex: string;
  light: M3Palette;
  dark: M3Palette;
} {
  const { h, s } = hexToHsl(hex);
  return {
    name,
    seedHex: hex,
    light: createM3PaletteFromHsl(h, s, false),
    dark: createM3PaletteFromHsl(h, s, true),
  };
}

/**
 * Creates custom inline styles for CSS variables so components can use standard tailwind reference classes
 */
export function applyM3ThemeToCssVariables(palette: M3Palette): Record<string, string> {
  return {
    "--m3-primary": palette.primary,
    "--m3-on-primary": palette.onPrimary,
    "--m3-primary-container": palette.primaryContainer,
    "--m3-on-primary-container": palette.onPrimaryContainer,
    "--m3-secondary": palette.secondary,
    "--m3-on-secondary": palette.onSecondary,
    "--m3-secondary-container": palette.secondaryContainer,
    "--m3-on-secondary-container": palette.onSecondaryContainer,
    "--m3-tertiary": palette.tertiary,
    "--m3-on-tertiary": palette.onTertiary,
    "--m3-tertiary-container": palette.tertiaryContainer,
    "--m3-on-tertiary-container": palette.onTertiaryContainer,
    "--m3-error": palette.error,
    "--m3-on-error": palette.onError,
    "--m3-error-container": palette.errorContainer,
    "--m3-on-error-container": palette.onErrorContainer,
    "--m3-background": palette.background,
    "--m3-on-background": palette.onBackground,
    "--m3-surface": palette.surface,
    "--m3-on-surface": palette.onSurface,
    "--m3-surface-variant": palette.surfaceVariant,
    "--m3-on-surface-variant": palette.onSurfaceVariant,
    "--m3-outline": palette.outline,
    "--m3-outline-variant": palette.outlineVariant,
  };
}
