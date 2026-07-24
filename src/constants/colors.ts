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
