import path from "path"
import fs from "fs/promises"

const rootNodeModulesPath = path.resolve("../../node_modules")

const copyPdfkitFonts = async () => {
  const files = ["Helvetica.afm", "Helvetica-Bold.afm"]
  const pdfkitFontPath = path.resolve(rootNodeModulesPath, "pdfkit/js/data")

  for (const file of files) {
    await fs.cp(
      path.resolve(pdfkitFontPath, file),
      path.resolve("dist/data", file)
    )
  }
}

export const copyUnbundableDeps = async () => {
  await copyPdfkitFonts()
}
