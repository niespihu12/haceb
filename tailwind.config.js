/** @type {import('tailwindcss').Config} */
/**
 * Paleta del simulador AION ORDER (02 · Gestionar pedidos).
 *
 * Los cinco bloques del flujo end-to-end (seccion 4 del blueprint) llevan un
 * color cada uno; las cuatro categorias del modelo de decision (seccion 11)
 * llevan el suyo. El resto son neutros de la familia de simuladores.
 *
 *   --captura:#2563eb  --validacion:#0d9488  --promesa:#d97706
 *   --excepcion:#e11d48  --liberacion:#7c3aed  --comunicacion:#0891b2
 *   --catA:#64748b  --catB:#4f46e5  --catC:#d97706  --catD:#be123c
 *   --bg:#f7f8fa --panel:#ffffff --ink:#141b2d --muted:#5b6472 --line:#e4e7ec
 */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // --- Identidad AION ---------------------------------------------
        aion: {
          ink: "#141b2d",
          "ink-light": "#e8eaf0",
          "ink-dark": "#0b1020",
          muted: "#5b6472",
          line: "#e4e7ec",
          panel: "#ffffff",
          bg: "#f7f8fa",
          // Azul aclarado para texto sobre el fondo oscuro de la presentacion
          accent: "#8ab4ff",
        },
        // --- Bloques del flujo end-to-end -------------------------------
        captura: {
          DEFAULT: "#2563eb",
          light: "#eaf1ff",
          dark: "#1d4ed8",
        },
        validacion: {
          DEFAULT: "#0d9488",
          light: "#e5f6f3",
          dark: "#0f766e",
        },
        promesa: {
          DEFAULT: "#d97706",
          light: "#fdf1e0",
          dark: "#b45309",
        },
        excepcion: {
          DEFAULT: "#e11d48",
          light: "#fdeaf0",
          dark: "#be123c",
        },
        liberacion: {
          DEFAULT: "#7c3aed",
          light: "#f2ecfd",
          dark: "#6d28d9",
        },
        comunicacion: {
          DEFAULT: "#0891b2",
          light: "#e0f4f9",
          dark: "#0e7490",
        },
        // --- Categorias del modelo de decision --------------------------
        catA: {
          DEFAULT: "#64748b",
          light: "#f1f5f9",
          dark: "#475569",
        },
        catB: {
          DEFAULT: "#4f46e5",
          light: "#eef2ff",
          dark: "#4338ca",
        },
        catC: {
          DEFAULT: "#d97706",
          light: "#fdf1e0",
          dark: "#b45309",
        },
        catD: {
          DEFAULT: "#be123c",
          light: "#fdeaf0",
          dark: "#9f1239",
        },
        // --- Semanticos -------------------------------------------------
        success: {
          DEFAULT: "#059669",
          light: "#d1fae5",
        },
        warning: {
          DEFAULT: "#d97706",
          light: "#fef3c7",
        },
        error: {
          DEFAULT: "#dc2626",
          light: "#fee2e2",
        },
        info: {
          DEFAULT: "#2563eb",
          light: "#dbeafe",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 3px 0 rgb(16 24 40 / 0.06), 0 8px 24px -12px rgb(16 24 40 / 0.10)",
        "card-hover": "0 10px 15px -3px rgb(16 24 40 / 0.08), 0 4px 6px -4px rgb(16 24 40 / 0.05)",
        "slide": "0 20px 40px -12px rgb(16 24 40 / 0.18)",
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
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "flash-blue": {
          "0%": { backgroundColor: "rgba(234,241,255,0.9)" },
          "100%": { backgroundColor: "transparent" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bar-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--target-width)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "flow-dash": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        "loop-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // --- Escritorio RPA (pestaña Agentes) ---------------------------
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "scale-pulse": {
          "0%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        "clic-onda": {
          "0%": { transform: "scale(0.4)", opacity: "0.7" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "rec-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        "toast-in": {
          "0%": { transform: "translateX(16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "barrido-ocr": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "flash-blue": "flash-blue 500ms ease-out forwards",
        "slide-in-right": "slide-in-right 300ms ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "scale-pulse": "scale-pulse 120ms ease-out",
        "clic-onda": "clic-onda 450ms ease-out forwards",
        "rec-blink": "rec-blink 1.4s ease-in-out infinite",
        "toast-in": "toast-in 220ms ease-out",
        "barrido-ocr": "barrido-ocr 900ms ease-in-out infinite",
        "slide-in-up": "slide-in-up 400ms ease-out",
        "bar-fill": "bar-fill 600ms ease-out forwards",
        "fade-in": "fade-in 500ms ease-out",
        "flow-dash": "flow-dash 1.2s linear infinite",
        "loop-spin": "loop-spin 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
