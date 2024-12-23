import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";

const fullReloadAlways: PluginOption = {
    name: "full-reload-always",
    handleHotUpdate({ server }) {
        server.ws.send({ type: "full-reload" });
        return [];
    },
};

export default defineConfig(({ mode }) => ({
    base:
        process.env.VITE_BASE_URL ||
        (mode === "production"
            ? "https://ulucode.com/random/webgputests/linked/"
            : "/"),
    plugins: [react(), fullReloadAlways],
    build: {
        target: "esnext",
        sourcemap: mode === "production", // Enable source maps only in production
    },
    esbuild: {
        supported: {
            "top-level-await": true,
        },
    },
    optimizeDeps: {
        exclude: ["three"],
    },
    server: {
        host: "0.0.0.0",
        port: 3000,
        open: true,
    },
}));
