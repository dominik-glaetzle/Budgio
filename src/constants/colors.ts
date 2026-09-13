// iOS system colors, matching Apple Pay / Wallet's palette.
export const accentColor = {
  light: "#007AFF",
  dark: "#0A84FF",
} as const;

export const secondaryColor = {
  light: "#6C6C70",
  dark: "#8E8E93",
} as const;

export const surfaceColor = {
  light: "#F2F2F7",
  dark: "#1C1C1E",
} as const;

export const placeholderColor = {
  light: "#C7C7CC",
  dark: "#48484A",
} as const;

// Categorical chart palette, fixed slot order (identity, never re-cycled).
// Validated against the app's white/black surfaces: light passes with a
// contrast WARN on slots 3-5, mitigated by the always-visible legend labels.
export const categoricalPalette = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181"],
} as const;

// Pastel per-category icon tints (chip background / glyph color). Assigned
// by a stable hash of the category key (see lib/category-icons.ts), not
// cycled by rank like categoricalPalette above — a given category always
// renders the same tint wherever its icon appears.
export const categoryTintPalette = {
  light: [
    { bg: "#E8F1FC", fg: "#2A78D6" },
    { bg: "#FDEFE6", fg: "#E0682F" },
    { bg: "#E9F6EF", fg: "#1BAF7A" },
    { bg: "#FBF1DD", fg: "#C98A12" },
    { bg: "#FBE9F1", fg: "#D46596" },
    { bg: "#EFECFB", fg: "#6B5BD6" },
  ],
  dark: [
    { bg: "rgba(42,120,214,0.18)", fg: "#5B9EEE" },
    { bg: "rgba(224,104,47,0.16)", fg: "#F0894D" },
    { bg: "rgba(27,175,122,0.16)", fg: "#3ECF93" },
    { bg: "rgba(201,138,18,0.18)", fg: "#E0A83D" },
    { bg: "rgba(212,101,150,0.18)", fg: "#E38AB0" },
    { bg: "rgba(107,91,214,0.20)", fg: "#9B8CF0" },
  ],
} as const;
