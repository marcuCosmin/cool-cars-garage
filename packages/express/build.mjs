import * as esbuild from "esbuild"

import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const copyPDFKitFont = async () => {
  try {
    const src = path.resolve(
      __dirname,
      "../../node_modules/pdfkit/js/data/Helvetica.afm"
    )
    const destDir = path.resolve(__dirname, "dist/data")

    await fs.mkdir(destDir, { recursive: true })
    await fs.copyFile(src, path.join(destDir, "Helvetica.afm"))

    console.log("Copied PDFKit font")
  } catch (error) {
    console.log("Error copying PDFKit font:", error)
  }
}

await esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  outdir: "./dist",
  platform: "node"
})

await copyPDFKitFont()
