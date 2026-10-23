import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    testTimeout: 20_000,
  },
  // D-144 段 4: component (.tsx) を SSR テストで import するため JSX を automatic runtime で変換する (tsconfig は Next 用に preserve)
  oxc: { jsx: { runtime: "automatic" } },
  // Next 用の postcss.config (tailwind plugin) は vite では読めないため、テストでは PostCSS を空にする (CSS Modules はクラス名オブジェクトとして解決)
  css: { postcss: { plugins: [] } },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Next aliases `server-only` to its compiled marker (empty in server code, throws in client code);
      // vitest runs server modules, so resolve it to the empty side like Next does for the server.
      "server-only": fileURLToPath(new URL("./node_modules/next/dist/compiled/server-only/empty.js", import.meta.url)),
    },
  },
});
