import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        consultant: resolve(__dirname, 'consultant.html'),
        client: resolve(__dirname, 'client.html'),
        feedback: resolve(__dirname, 'feedback.html'),
        crisis: resolve(__dirname, 'crisis.html'),
        resources: resolve(__dirname, 'resources.html'),
      },
    },
  },
})
