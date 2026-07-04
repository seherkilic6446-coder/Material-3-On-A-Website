import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { M3Palette } from "../types";

interface PaletteGeneratorProps {
  palette: M3Palette;
  isDark: boolean;
}

export const PaletteGenerator: React.FC<PaletteGeneratorProps> = ({
  palette,
  isDark,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const colorRoles: Array<{
    name: string;
    key: keyof M3Palette;
    description: string;
  }> = [
    {
      name: "Primary",
      key: "primary",
      description: "Key color used for primary buttons, active states, and prominent UI elements.",
    },
    {
      name: "On Primary",
      key: "onPrimary",
      description: "Text or icon color used on top of the Primary color.",
    },
    {
      name: "Primary Container",
      key: "primaryContainer",
      description: "Softer container fill for prominent but non-actionable elements.",
    },
    {
      name: "On Primary Container",
      key: "onPrimaryContainer",
      description: "Text or icon color used on top of the Primary Container.",
    },

    {
      name: "Secondary",
      key: "secondary",
      description: "Less prominent key color for chips, selection controls, and accents.",
    },
    {
      name: "On Secondary",
      key: "onSecondary",
      description: "Text or icon color used on top of the Secondary color.",
    },
    {
      name: "Secondary Container",
      key: "secondaryContainer",
      description: "Container fill for secondary components (e.g. active navigation).",
    },
    {
      name: "On Secondary Container",
      key: "onSecondaryContainer",
      description: "Text or icon color used on top of the Secondary Container.",
    },

    {
      name: "Tertiary",
      key: "tertiary",
      description: "Contrasting accent color to bring focus, or used for supplementary highlights.",
    },
    {
      name: "On Tertiary",
      key: "onTertiary",
      description: "Text or icon color used on top of the Tertiary color.",
    },
    {
      name: "Tertiary Container",
      key: "tertiaryContainer",
      description: "Container fill for tertiary elements.",
    },
    {
      name: "On Tertiary Container",
      key: "onTertiaryContainer",
      description: "Text or icon color used on top of the Tertiary Container.",
    },

    {
      name: "Error",
      key: "error",
      description: "Vibrant attention-grabbing color for critical states, alerts, and destructive actions.",
    },
    {
      name: "On Error",
      key: "onError",
      description: "Text or icon color used on top of the Error color.",
    },
    {
      name: "Error Container",
      key: "errorContainer",
      description: "Container fill for warning panels or bad input states.",
    },
    {
      name: "On Error Container",
      key: "onErrorContainer",
      description: "Text or icon color used on top of the Error Container.",
    },

    {
      name: "Background",
      key: "background",
      description: "The base level background color behind scrollable content areas.",
    },
    {
      name: "On Background",
      key: "onBackground",
      description: "General body text color on top of the Background.",
    },
    {
      name: "Surface",
      key: "surface",
      description: "The primary container level color, used for cards, dialogs, and sheets.",
    },
    {
      name: "On Surface",
      key: "onSurface",
      description: "General body text and icons used on top of Surfaces.",
    },

    {
      name: "Surface Variant",
      key: "surfaceVariant",
      description: "Alternative surface color for sidebar drawers, dividers, and empty states.",
    },
    {
      name: "On Surface Variant",
      key: "onSurfaceVariant",
      description: "Medium-emphasis text or icons used on top of Surface Variant.",
    },
    {
      name: "Outline",
      key: "outline",
      description: "Slightly stronger divider borders, text field boundaries, and switch tracks.",
    },
    {
      name: "Outline Variant",
      key: "outlineVariant",
      description: "Slightly softer divider lines and outlined card borders.",
    },
  ];

  // Helper to determine text contrast on the background cells
  const getTextColor = (roleKey: keyof M3Palette) => {
    if (
      roleKey === "primary" ||
      roleKey === "secondary" ||
      roleKey === "tertiary" ||
      roleKey === "error"
    ) {
      return "text-white"; // Standard key colors are highly saturated
    }
    
    // In dark mode, 'on' colors or background containers are light
    if (isDark) {
      if (roleKey.toLowerCase().includes("on")) {
        return "text-neutral-950";
      }
      return "text-neutral-100";
    } else {
      // In light mode
      if (roleKey.toLowerCase().includes("on")) {
        return "text-neutral-50";
      }
      return "text-neutral-900";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-[var(--m3-on-surface)]">
          Material You Tonal Palette
        </h3>
        <p className="text-sm text-[var(--m3-on-surface-variant)] leading-relaxed">
          The core of Material 3 is dynamic coloring. From a single seed color, a matching, mathematically accessible light or dark theme palette is generated. Click on any color cell below to copy its hex value.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {colorRoles.map((role) => {
          const hex = palette[role.key] as string;
          const isCopied = copiedKey === role.key;

          return (
            <div
              key={role.key}
              onClick={() => copyToClipboard(hex, role.key)}
              className="group relative cursor-pointer overflow-hidden rounded-[16px] border border-[var(--m3-outline-variant)] hover:border-[var(--m3-outline)] hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between h-36 bg-[var(--m3-surface)]"
            >
              {/* Top Row: Role label and Copy status */}
              <div className="flex justify-between items-start w-full gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--m3-on-surface)]">
                    {role.name}
                  </h4>
                  <span className="text-[10px] font-mono opacity-65 text-[var(--m3-on-surface-variant)]">
                    {role.key}
                  </span>
                </div>
                <div className="text-[var(--m3-on-surface-variant)] group-hover:text-[var(--m3-primary)] transition-colors">
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>

              {/* Middle Row: Short Description */}
              <p className="text-[11px] text-[var(--m3-on-surface-variant)] leading-normal mt-1 line-clamp-2">
                {role.description}
              </p>

              {/* Bottom Row: Visual Color Preview Pillar */}
              <div className="mt-3 flex items-center gap-2">
                <div
                  className="h-6 w-12 rounded-md shadow-sm border border-neutral-300 dark:border-neutral-700 transition-all group-hover:scale-105"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-xs font-mono font-bold text-[var(--m3-on-surface)]">
                  {hex.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
