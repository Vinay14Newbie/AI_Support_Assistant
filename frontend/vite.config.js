import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward /api requests to backend running on port 5000
      "/api": "http://localhost:5000",
    },
  },
})
