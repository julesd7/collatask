import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: [
        "n0skcskcoc048wgggkggsgo8.49.12.229.147.sslip.io"
      ],
  },
});
