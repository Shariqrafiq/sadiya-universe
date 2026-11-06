import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // works on GitHub Pages under /repo-name/ and on any other host
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three', '@react-three/fiber'], motion: ['framer-motion'] },
      },
    },
  },
})
