import * as esbuild from "esbuild"

import { copyUnbundableDeps } from "./copyUnbundableDeps.mjs"

await copyUnbundableDeps()

const ctx = await esbuild.context({
  entryPoints: ["./src/index.ts"],
  outdir: "./dist",
  bundle: true,
  platform: "node",
  sourcemap: true
})

await ctx.watch()
