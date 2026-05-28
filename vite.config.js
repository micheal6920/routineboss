import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/routineboss/', // Change to your GitHub repo name for Pages deployment
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
  },
})
