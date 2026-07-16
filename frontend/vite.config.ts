import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Patota Barbearia Becker",
        short_name: "Becker FC",
        description: "Gestão da Patota Barbearia Becker",
        theme_color: "#0b0f17",
        background_color: "#0b0f17",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/icons/icon.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});
