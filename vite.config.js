import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: [
      'localhost',
      '.ngrok.io',
      '.ngrok-free.app',
      '232c-46-60-54-4.ngrok-free.app',
      'bringus-main.onrender.com'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // Utilities and contexts
          'app-core': [
            './src/contexts/CartContext.jsx',
            './src/contexts/WishlistContext.jsx',
            './src/contexts/ThemeContext.jsx',
            './src/contexts/AppDataContext.jsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
