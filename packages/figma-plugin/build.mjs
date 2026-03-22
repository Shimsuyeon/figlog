import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

await build({
  entryPoints: ["src/code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  target: "es2017",
  format: "iife",
});

const uiHtml = readFileSync("src/ui.html", "utf-8");
mkdirSync("dist", { recursive: true });
writeFileSync("dist/ui.html", uiHtml);

console.log("Build complete");
