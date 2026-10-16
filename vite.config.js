import { defineConfig } from "vite";
import { resolve } from "node:path";
export default defineConfig({
  base: "/sbm/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        configurator: resolve(import.meta.dirname, "configurateur.html"),
        quote: resolve(import.meta.dirname, "devis.html"),
        individuals: resolve(import.meta.dirname, "particuliers.html"),
        professionals: resolve(import.meta.dirname, "professionnels.html"),
        materials: resolve(import.meta.dirname, "matieres.html"),
        legal: resolve(import.meta.dirname, "mentions-legales.html"),
        privacy: resolve(import.meta.dirname, "confidentialite.html"),
      },
      output: { manualChunks: { three: ["three"] } },
    },
  },
});
