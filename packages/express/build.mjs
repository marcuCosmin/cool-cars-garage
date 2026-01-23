import * as esbuild from "esbuild"
import fs from "fs"

const isDev = process.env.NODE_ENV !== "production"

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"))

const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
}

const buildCommonOptions = {
  bundle: true,
  outdir: "./dist",
  platform: "node",
  external: Object.keys(allDeps),
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
