import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果部署在 GitHub Pages (網址後綴為 /pixelgame/)，請使用 repo 名稱：
  base: '/pixel-game/',
  // 如果是部署在 Vercel 或 Netlify (網址在根目錄 /)，請改為：
  // base: '/',
})
