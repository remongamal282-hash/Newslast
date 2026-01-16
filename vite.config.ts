import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/proxy': {
        target: 'https://backend.ascww.org/api',
        changeOrigin: true,
        secure: false, // Ignore self-signed or invalid certs just in case
        rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
      },
    },
  },
})