import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // The site is served from https://miriants.github.io/photo-portfolio/,
  // so every asset URL needs this prefix. Change it if the repo is renamed.
  base: '/photo-portfolio/',
  plugins: [react()],
})
