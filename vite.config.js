import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  base: "/sbm/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        legal: resolve(import.meta.dirname, "mentions-legales.html"),
        privacy: resolve(import.meta.dirname, "confidentialite.html"),
      },
      output: { manualChunks: { three: ["three"] } },
    },
  },
});
