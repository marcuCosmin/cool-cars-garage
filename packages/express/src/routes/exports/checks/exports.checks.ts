import path from "path"

import type {
  ExportResult,
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
  getDefectsAttachmentResults,
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
  CheckDoc,
  CheckWithDriver,
  DocWithID,
  FullCheck
} from "@/globals/firestore/firestore.model"

import type { ExportPayload } from "@/globals/requests/requests.model"

type GetIndividualCheckFilesProps = {
  check: DocWithID<CheckDoc>
  signal: AbortSignal
}

const getIndividualCheckFiles = async ({
  check,
  signal
}: GetIndividualCheckFilesProps): Promise<ExportResult> => {
  const fullCheck = await buildFullCheck(check)

  const buffer = await generatePDF({
    body: renderIndividualCheckBody(fullCheck),
    signal,
    errorMessage: "Could not generate the report, please try again"
  })

  const attachmentFiles = await getDefectsAttachmentFiles({
    fullCheck,
    signal
  })

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

type GetBulkChecksFilesProps = {
  checks: DocWithID<CheckDoc>[]
  filters: ExportPayload<"checks">["filters"]
  signal: AbortSignal
}

const getBulkChecksFiles = async ({
  checks,
  filters,
  signal
}: GetBulkChecksFilesProps): Promise<ExportResult> => {
  const defectiveChecks = checks.filter(
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
    ...checks.map(({ driverId }) => driverId),
    ...defectsUsersIds
  ])

  const checksWithDrivers: CheckWithDriver[] = checks.map(
    ({ driverId, ...check }) => ({
      ...check,
      driver: getSimplifiedUser({ usersMap, userId: driverId })
    })
  )

  const summaryBuffer = await generatePDF({
    body: renderBulkChecksBody(checksWithDrivers),
    signal,
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
              body: renderIndividualCheckBody(fullCheck),
              signal
            }),
            contentType: "application/pdf"
          }
        }
      } catch (error) {
        if (!signal.aborted) {
          console.log(error)
        }

        return { fullCheck, file: null }
      }
    })
  )

  files.push(...generatedReports.flatMap(({ file }) => (file ? [file] : [])))

  const attachmentResults = (
    await Promise.all(
      defectiveFullChecks.map(fullCheck =>
        getDefectsAttachmentResults({ fullCheck, signal })
      )
    )
  ).flat()

  files.push(...attachmentResults.flatMap(({ file }) => (file ? [file] : [])))

  const failedReportsFilenames = generatedReports.flatMap(
    ({ fullCheck, file }) => (file ? [] : [getCheckFilename(fullCheck)])
  )

  const failedAttachmentsFilenames = attachmentResults.flatMap(
    ({ filename, file }) => (file ? [] : [filename])
  )

  if (!failedReportsFilenames.length && !failedAttachmentsFilenames.length) {
    return { files }
  }

  return {
    files,
    warnings: {
      failedReports: failedReportsFilenames,
      failedReportsCount: failedReportsFilenames.length,
      failedAttachments: failedAttachmentsFilenames,
      failedAttachmentsCount: failedAttachmentsFilenames.length
    }
  }
}

export const getCheckFiles: GetFiles<"checks"> = async ({
  payload: { filters, cap, order },
  signal
}) => {
  const checks = await getFirestoreDocs({
    collection: "checks",
    queries: filters,
    limit: cap,
    orderBy: order
  })

  if (!checks.length) {
    return { files: [] }
  }

  if (checks.length === 1) {
    const [check] = checks

    return getIndividualCheckFiles({ check, signal })
  }

  return getBulkChecksFiles({ checks, filters, signal })
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
