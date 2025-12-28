import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // <--- Add this! This makes paths relative instead of absolute
  server: {
    port: 5173,
    strictPort: true,
  }
})
