import type { GeneratedExportFile, GetFiles } from "../exports.model"

import { generatePDF } from "../utils/exports.pdf.utils"

import {
  buildFullCheck,
  buildFullDefects,
  getCheckFilename,
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
    return []
  }

  if (checksSearchResult.length === 1) {
    const [check] = checksSearchResult
    const fullCheck = await buildFullCheck(check)
    const individualCheckHTML = renderIndividualCheckBody(fullCheck)

    const buffer = await generatePDF(individualCheckHTML)

    const attachmentFiles = await getDefectsAttachmentFiles(fullCheck)

    return [
      {
        filename: getCheckFilename(fullCheck),
        buffer,
        contentType: "application/pdf"
      },
      ...attachmentFiles
    ]
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

  const files: GeneratedExportFile[] = [
    {
      filename: "checks-summary.pdf",
      buffer: await generatePDF(renderBulkChecksBody(checksWithDrivers)),
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

  const defectiveChecksFiles = await Promise.all(
    defectiveFullChecks.map(async fullCheck => ({
      filename: getCheckFilename(fullCheck),
      buffer: await generatePDF(renderIndividualCheckBody(fullCheck)),
      contentType: "application/pdf"
    }))
  )

  files.push(...defectiveChecksFiles)

  return files
}
