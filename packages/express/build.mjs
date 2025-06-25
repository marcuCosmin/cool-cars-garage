import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  outdir: "./dist",
  format: "esm",
  platform: "node",
  splitting: true
})
