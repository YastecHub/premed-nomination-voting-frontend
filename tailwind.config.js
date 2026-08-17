/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#05080f",
          900: "#0a0f1e",
          800: "#0d1529",
          700: "#111d3a",
          600: "#162248",
        },
        gold: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["DM Serif Display", "serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse at 20% 50%, #162248 0%, #0a0f1e 50%, #05080f 100%)",
        "card-glow":
          "radial-gradient(circle at top left, rgba(99,102,241,0.15), transparent 60%)",
        "gold-gradient": "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
        "indigo-gradient": "linear-gradient(135deg, #6366f1, #8b5cf6)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "bar-grow": "bar-grow 0.8s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px 2px rgba(99,102,241,0.3)" },
          "50%": { boxShadow: "0 0 20px 6px rgba(99,102,241,0.6)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bar-grow": {
          "0%": { width: "0%" },
          "100%": { width: "var(--bar-width)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-indigo": "0 0 20px rgba(99,102,241,0.4)",
        "glow-gold": "0 0 20px rgba(251,191,36,0.4)",
        "glow-teal": "0 0 20px rgba(20,184,166,0.4)",
        card: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};
