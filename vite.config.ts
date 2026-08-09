import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import builtins from "builtin-modules";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [{ src: "manifest.json", dest: "." }],
    }),
  ],
  build: {
    lib: {
      entry: "src/main.tsx",
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        "obsidian",
        "electron",
        "@codemirror/*",
        "@lezer/*",
        ...builtins,
      ],
      output: {
        inlineDynamicImports: true,
        assetFileNames: "styles.css",
        plugins: [
          {
            name: "reject-non-css-assets",
            generateBundle(_options, bundle) {
              for (const [fileName, asset] of Object.entries(bundle)) {
                if (asset.type === "asset" && !fileName.endsWith(".css")) {
                  delete bundle[fileName];
                }
              }
            },
          },
        ],
      },
    },
    outDir: path.join(__dirname, ".obsidian", "plugins", "obsidian-ai"),
    sourcemap: false,
    minify: "esbuild",
    emptyOutDir: false,
  },
});
