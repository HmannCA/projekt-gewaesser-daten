import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    // HIER IST DIE NEUE PROXY-KONFIGURATION
    proxy: {
      // Leitet alle Anfragen, die mit /api beginnen, an Ihr Backend weiter
      '/api': {
        target: 'http://127.0.0.1:3001', // Die Adresse Ihres Backend-Servers
        changeOrigin: true, // Notwendig für virtuelle Hosts
      }
    }
  }
})