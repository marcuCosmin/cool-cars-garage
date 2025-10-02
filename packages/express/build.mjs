import * as esbuild from "esbuild"

import { copyUnbundableDeps } from "./copyUnbundableDeps.mjs"

await copyUnbundableDeps()

await esbuild.build({
  entryPoints: ["./src/index.ts", "./src/jobs/**"],
  bundle: true,
  outdir: "./dist",
  platform: "node"
})
