import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the built game works from any folder (medhaa.net games-static, a USB stick, D:\ …)
export default defineConfig({
  plugins: [react()],
  base: './',
})
