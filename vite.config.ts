import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";

// Full reload plugin to handle hot updates
const fullReloadAlways: PluginOption = {
    name: "full-reload-always",
    handleHotUpdate({ server }) {
        server.ws.send({ type: "full-reload" });
        return [];
    },
};

// Define Vite configuration
export default defineConfig(({ mode }) => ({
    // Use environment variable or fallback to the EC2 IP or local path
    base:
        process.env.VITE_BASE_URL ||
        (mode === "production"
            ? "https://54.152.0.220/" // Change this to your EC2 IP
            : "/"),

    // Plugins
    plugins: [react(), fullReloadAlways],

    // Build configurations
    build: {
        target: "esnext",
        sourcemap: mode === "production", // Enable source maps in production for debugging
        outDir: "dist", // Output directory
        assetsDir: "assets", // Place assets in 'assets' folder
        manifest: true, // Generate a manifest for easier deployment
    },

    // Optimize dependencies to exclude certain packages during build
    optimizeDeps: {
        exclude: ["three"],
    },

    // esbuild configurations
    esbuild: {
        supported: {
            "top-level-await": true,
        },
    },

    // Development server configuration
    server: {
        host: "0.0.0.0", // Listen on all interfaces
        port: 3000, // Dev server port
        open: true, // Auto open the browser on server start
        cors: true, // Enable CORS
    },
}));
