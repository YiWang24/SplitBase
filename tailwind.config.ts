import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pixelify Sans", "system-ui", "sans-serif"],
        mono: ["Pixelify Sans", "monospace"],
      },
      colors: {
        // Custom color system based on theme colors
        brand: {
          primary: "#c9e265", // Primary - bright yellow-green
          secondary: "#89d957", // Secondary - fresh green
          primaryLight: "#d7ea8a", // Primary (light)
          primaryDark: "#b8d14a", // Primary (dark)
          secondaryLight: "#a0e06a", // Secondary (light)
          secondaryDark: "#7ac94a", // Secondary (dark)
          accent: "#6bbf3a", // Accent - deep green
          accentLight: "#8cd45a", // Accent (light)
        },
        // Neutral color system
        neutral: {
          50: "#f8faf5", // Lightest background
          100: "#f1f5ed", // Light background
          200: "#e3e9d7", // Border color
          300: "#cbd5b3", // Input background
          400: "#a3b583", // Disabled state
          500: "#7a9563", // Secondary text
          600: "#5a7a4a", // Primary text
          700: "#3d5f35", // Dark text
          800: "#2a4528", // Dark background
          900: "#1a2b1a", // Darkest
        },
        // Semantic color system
        success: {
          light: "#d4edda",
          main: "#89d957",
          dark: "#5a7a4a",
        },
        warning: {
          light: "#fff3cd",
          main: "#ffc107",
          dark: "#856404",
        },
        error: {
          light: "#f8d7da",
          main: "#dc3545",
          dark: "#721c24",
        },
        info: {
          light: "#d1ecf1",
          main: "#17a2b8",
          dark: "#0c5460",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      // Custom gradient backgrounds
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #c9e265 0%, #89d957 100%)",
        "brand-gradient-light":
          "linear-gradient(135deg, #d7ea8a 0%, #a0e06a 100%)",
        "brand-gradient-dark":
          "linear-gradient(135deg, #b8d14a 0%, #7ac94a 100%)",
        "soft-gradient": "linear-gradient(135deg, #f8faf5 0%, #f1f5ed 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,245,0.95) 100%)",
      },
      // Custom shadows
      boxShadow: {
        brand: "0 4px 20px rgba(201, 226, 101, 0.2)",
        "brand-lg": "0 8px 30px rgba(201, 226, 101, 0.25)",
        "brand-xl": "0 12px 40px rgba(201, 226, 101, 0.3)",
        "brand-inner": "inset 0 2px 4px rgba(201, 226, 101, 0.1)",
        soft: "0 2px 10px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "fade-out": "1s fadeOut 3s ease-out forwards",
        "brand-pulse": "brandPulse 2s ease-in-out infinite",
        "brand-bounce": "brandBounce 0.6s ease-out",
        "brand-glow": "brandGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeOut: {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
        brandPulse: {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.8",
          },
        },
        brandBounce: {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.02)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        brandGlow: {
          "0%, 100%": {
            boxShadow: "0 4px 20px rgba(201, 226, 101, 0.2)",
          },
          "50%": {
            boxShadow: "0 6px 30px rgba(201, 226, 101, 0.3)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
