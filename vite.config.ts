import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8081,
    // 로컬(localhost:8081)에서는 기본 HMR 사용. gomguk.cloud 터널 접속 시에만 아래 설정 사용
    hmr: process.env.VITE_HMR_REMOTE
      ? { clientPort: 443, host: 'gomguk.cloud', protocol: 'wss' }
      : true,
    proxy: {
      '/api': {
        target: 'https://gomguk.cloud',
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/s3-images': {
        target: 'https://papers.s3.ap-northeast-2.amazonaws.com', // Assuming Seoul region based on user language
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/s3-images/, ''),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.png", "gomguk_logo.png"],
      manifest: {
        name: "Gomguk",
        short_name: "Gomguk",
        description: "Gomguk: Your Personal Goal Raider",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
