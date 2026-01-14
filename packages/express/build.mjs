import * as esbuild from "esbuild"

const isDev = process.env.NODE_ENV !== "production"

const buildCommonOptions = {
  bundle: true,
  outdir: "./dist",
  platform: "node",
  packages: "external",
  sourcemap: isDev
}

const build = async () => {
  if (isDev) {
    const ctx = await esbuild.context({
      entryPoints: ["./src/index.ts"],
      ...buildCommonOptions,
      target: "es2020"
    })

    await ctx.watch()
    return
  }

  await esbuild.build({
    entryPoints: ["./src/index.ts", "./src/jobs/**"],
    ...buildCommonOptions
  })
}

await build()
