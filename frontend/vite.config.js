import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://collabrix-1-a8d6.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
