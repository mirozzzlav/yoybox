import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: "src/index.js", formats: ["es"], fileName: "index" },
    sourcemap: true,
    rollupOptions: {
      external: (id) => /^(react|react-dom|@emotion\/css)(\/|$)/.test(id),
    },
  },
});
