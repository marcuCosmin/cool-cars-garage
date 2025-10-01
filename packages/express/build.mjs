import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["./src/index.ts", "./src/jobs/**"],
  bundle: true,
  outdir: "./dist",
  platform: "node"
})
