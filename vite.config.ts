import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  // Las variables VITE_* (Supabase) se leen de antifraude/.env.local,
  // compartido por todos los simuladores.
  envDir: path.resolve(__dirname, '..'),
  plugins: [react()],
  server: {
    port: 3038,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
