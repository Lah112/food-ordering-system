import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false, // If your backend has HTTPS, set this to true
      },
      '/socket.io': { // Proxy for Socket.IO
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})