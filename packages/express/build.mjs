import * as esbuild from "esbuild"
import fs from "fs"
import { exec, spawn } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

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

const tailwindArgs = [
  "@tailwindcss/cli",
  "-i",
  "./src/routes/exports/utils/exports.pdf.css",
  "-o",
  "./dist/exports.pdf.css"
]

const buildPrintCss = async () => {

  if (isDev) {
    await execAsync(`npx ${tailwindArgs.join(" ")}`)
    spawn("npx", [...tailwindArgs, "--watch"], {
      stdio: "inherit",
      shell: isDev
    })
    return
  }

  await execAsync(`npx ${tailwindArgs.join(" ")} --minify`)
}

const build = async () => {
  if (isDev) {
    const ctx = await esbuild.context({
      entryPoints: ["./src/index.ts"],
      ...buildCommonOptions,
      target: "es2020"
    })

    await buildPrintCss()
    await ctx.watch()
    return
  }

  await esbuild.build({
    entryPoints: ["./src/index.ts"],
    ...buildCommonOptions
  })
  await buildPrintCss()
}

await build()
