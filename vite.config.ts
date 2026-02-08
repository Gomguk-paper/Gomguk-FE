import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
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
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
