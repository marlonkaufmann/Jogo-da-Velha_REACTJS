import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/Jogo-da-Velha_REACTJS/",
  plugins: [react()],
})