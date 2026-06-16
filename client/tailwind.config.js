/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#111111",
        background: "#ffffff",
        foreground: "#111111",
        primary: {
          DEFAULT: "#111111",
          foreground: "#ffffff",
          active: "#242424",
          disabled: "#e5e7eb",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#111111",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#6b7280",
          soft: "#898989",
        },
        accent: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111111",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111111",
        },
        canvas: "#ffffff",
        ink: "#111111",
        body: "#374151",
        'surface-soft': "#f8f9fa",
        'surface-card': "#f5f5f5",
        'surface-strong': "#e5e7eb",
        'surface-dark': "#101010",
        'surface-dark-elevated': "#1a1a1a",
        'on-primary': "#ffffff",
        'on-dark': "#ffffff",
        'on-dark-soft': "#a1a1aa",
        hairline: "#e5e7eb",
        'hairline-soft': "#f3f4f6",
        brand: {
          accent: "#3b82f6",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        badge: {
          orange: "#fb923c",
          pink: "#ec4899",
          violet: "#8b5cf6",
          emerald: "#34d399",
        },
      },
      fontFamily: {
        display: ["Cal Sans", "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "9999px",
        full: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
