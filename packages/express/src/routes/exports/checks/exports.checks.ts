import { getUniqueFilenameGetter } from "../utils/exports.utils"

import type { GeneratedExportFile, GetFiles } from "../exports.model"

import { generatePDF } from "../utils/exports.pdf.utils"

import {
  buildFullCheck,
  getCheckFilename,
  getCheckSearchResult,
  getDefectsAttachmentFiles
} from "./exports.checks.utils"

import {
  renderBulkChecksBody,
  renderIndividualCheckBody
} from "./exports.checks.pdf"

export const getCheckFiles: GetFiles<"checks"> = async ({ payload }) => {
  const searchResult = await getCheckSearchResult(payload)

  if (!Array.isArray(searchResult)) {
    const individualCheckHTML = renderIndividualCheckBody(searchResult)
    const buffer = await generatePDF(individualCheckHTML)

    const attachmentFiles = await getDefectsAttachmentFiles(searchResult)

    return [
      {
        filename: getCheckFilename(searchResult),
        buffer,
        contentType: "application/pdf"
      },
      ...attachmentFiles
    ]
  }

  if (!searchResult.length) {
    return []
  }

  const files: GeneratedExportFile[] = [
    {
      filename: "checks-summary.pdf",
      buffer: await generatePDF(renderBulkChecksBody(searchResult)),
      contentType: "application/pdf"
    }
  ]

  const defectiveChecks = searchResult.filter(
    ({ faultsCount, incidentsCount }) => faultsCount || incidentsCount
  )

  const getUniqueFilename = getUniqueFilenameGetter()

  for (const { driver, ...check } of defectiveChecks) {
    const fullCheck = await buildFullCheck({ ...check, driverId: driver.id })
    const buffer = await generatePDF(renderIndividualCheckBody(fullCheck))

    files.push({
      filename: getUniqueFilename(getCheckFilename(fullCheck)),
      buffer,
      contentType: "application/pdf"
    })
  }

  return files
}
