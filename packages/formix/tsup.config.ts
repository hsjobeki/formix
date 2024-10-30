import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  sourcemap: true,
  format: ["esm", "cjs"],
  tsconfig: "./tsconfig.build.json",
  outExtension: (ctx) => {
    switch (ctx.format) {
      case "cjs":
        return { js: ".js" };
      case "esm":
        return { js: ".module.js" };
      case "iife":
        return { js: ".iife.js" };
    }
  },
});
