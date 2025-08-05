import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/shared/utils": path.resolve(__dirname, "../shared/src/utils"),
      "@/shared/consts": path.resolve(__dirname, "../shared/src/consts"),
      "@/routes": "/src/routes",
      "@/components": "/src/components",
      "@/models": "/src/models",
      "@/utils": "/src/utils",
      "@/redux": path.resolve(__dirname, "./src/redux"),
      "@/firebase": "/src/firebase",
      "@/api": "/src/api"
    }
  },
  plugins: [react(), tailwindcss()]
})
