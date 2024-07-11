import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    NodeGlobalsPolyfillPlugin({
      process: true,
      buffer: true,
    }),
    NodeModulesPolyfillPlugin(),
  ],
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
  resolve: {
    alias: {
      process: "process",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util",
    },
  },
  define: {
    "process.env": {},
  },
});
