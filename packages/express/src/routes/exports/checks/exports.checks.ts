import path from "path"

import type {
  GeneratedExportFile,
  GetArchiveName,
  GetFiles
} from "../exports.model"

import { generatePDF } from "../utils/exports.pdf.utils"

import {
  buildFullCheck,
  buildFullDefects,
  getCheckFilename,
  getChecksRangeName,
  getDefectsAttachmentFiles,
  getDefectsByCheckIds,
  getSimplifiedUser,
  getSimplifiedUsersMap
} from "./exports.checks.utils"

import {
  renderBulkChecksBody,
  renderIndividualCheckBody
} from "./exports.checks.pdf"
import {
  getChunkedFirestoreDocs,
  getFirestoreDocs
} from "@/backend/firebase/utils"

import type {
  CheckWithDriver,
  FullCheck
} from "@/globals/firestore/firestore.model"

export const getCheckFiles: GetFiles<"checks"> = async ({
  filters,
  cap,
  order
}) => {
  const checksSearchResult = await getFirestoreDocs({
    collection: "checks",
    queries: filters,
    limit: cap,
    orderBy: order
  })

  if (!checksSearchResult.length) {
    return { files: [] }
  }

  if (checksSearchResult.length === 1) {
    const [check] = checksSearchResult
    const fullCheck = await buildFullCheck(check)

    const buffer = await generatePDF({
      body: renderIndividualCheckBody(fullCheck),
      errorMessage: "Could not generate the report, please try again"
    })

    const attachmentFiles = await getDefectsAttachmentFiles(fullCheck)

    return {
      files: [
        {
          filename: getCheckFilename(fullCheck),
          buffer,
          contentType: "application/pdf"
        },
        ...attachmentFiles
      ]
    }
  }

  const defectiveChecks = checksSearchResult.filter(
    ({ incidentsCount, faultsCount }) => incidentsCount || faultsCount
  )
  const defectiveChecksIds = defectiveChecks.map(({ id }) => id)

  const [faultsByCheckId, incidentsByCheckId] = await Promise.all([
    getDefectsByCheckIds({
      checkIds: defectiveChecksIds,
      fetchDefects: filter =>
        getChunkedFirestoreDocs({ collection: "faults", filter })
    }),
    getDefectsByCheckIds({
      checkIds: defectiveChecksIds,
      fetchDefects: filter =>
        getChunkedFirestoreDocs({ collection: "incidents", filter })
    })
  ])

  const defectsUsersIds = defectiveChecksIds.flatMap(checkId =>
    [
      ...(faultsByCheckId.get(checkId) ?? []),
      ...(incidentsByCheckId.get(checkId) ?? [])
    ].flatMap(defect =>
      [defect.driverId, defect.resolutionUserId].filter(
        (userId): userId is string => !!userId
      )
    )
  )

  const usersMap = await getSimplifiedUsersMap([
    ...checksSearchResult.map(({ driverId }) => driverId),
    ...defectsUsersIds
  ])

  const checksWithDrivers: CheckWithDriver[] = checksSearchResult.map(
    ({ driverId, ...check }) => ({
      ...check,
      driver: getSimplifiedUser({ usersMap, userId: driverId })
    })
  )

  const summaryBuffer = await generatePDF({
    body: renderBulkChecksBody(checksWithDrivers),
    errorMessage: "Could not generate the export summary, please try again"
  })

  const files: GeneratedExportFile[] = [
    {
      filename: `${getChecksRangeName(filters)}.pdf`,
      buffer: summaryBuffer,
      contentType: "application/pdf"
    }
  ]

  const defectiveFullChecks: FullCheck[] = defectiveChecks.map(
    ({ driverId, ...check }) => ({
      ...check,
      driver: getSimplifiedUser({ usersMap, userId: driverId }),
      faults: buildFullDefects({
        defects: faultsByCheckId.get(check.id) ?? [],
        usersMap
      }),
      incidents: buildFullDefects({
        defects: incidentsByCheckId.get(check.id) ?? [],
        usersMap
      })
    })
  )

  const generatedReports = await Promise.all(
    defectiveFullChecks.map(async fullCheck => {
      try {
        return {
          fullCheck,
          file: {
            filename: getCheckFilename(fullCheck),
            buffer: await generatePDF({
              body: renderIndividualCheckBody(fullCheck)
            }),
            contentType: "application/pdf"
          }
        }
      } catch (error) {
        console.log(error)

        return { fullCheck, file: null }
      }
    })
  )

  files.push(
    ...generatedReports.flatMap(({ file }) => (file ? [file] : []))
  )

  const failedReportsFilenames = generatedReports.flatMap(({ fullCheck, file }) =>
    file ? [] : [getCheckFilename(fullCheck)]
  )

  if (!failedReportsFilenames.length) {
    return { files }
  }

  return {
    files,
    warnings: {
      failedReports: failedReportsFilenames,
      failedReportsCount: failedReportsFilenames.length
    }
  }
}

export const getChecksArchiveName: GetArchiveName<"checks"> = ({
  payload: { filters },
  files
}) => {
  const isSingleCheckExport = filters?.some(([field]) => field === "__name__")

  if (isSingleCheckExport) {
    const [{ filename }] = files

    return path.parse(filename).name
  }

  return getChecksRangeName(filters)
}
