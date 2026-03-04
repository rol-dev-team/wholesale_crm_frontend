import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add this block to allow Ngrok through the security filter
    allowedHosts: [
      "unoriginal-marylynn-cryptographal.ngrok-free.dev", // Your specific host
      ".ngrok-free.dev" // Optional: allows any Ngrok tunnel for easier daily dev
    ],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
