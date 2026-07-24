/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#007AFF", // iOS systemBlue (light)
          dark: "#0A84FF", // iOS systemBlue (dark)
        },
        surface: {
          DEFAULT: "#F2F2F7", // iOS systemGroupedBackground (light)
          dark: "#1C1C1E", // iOS secondarySystemBackground (dark)
        },
        secondary: {
          DEFAULT: "#6C6C70", // iOS secondaryLabel (light)
          dark: "#8E8E93", // iOS secondaryLabel (dark)
        },
      },
    },
  },
  plugins: [],
};
