import path from "path"

import { storage } from "@/backend/firebase/config"
import { getFirestoreDocs } from "@/backend/firebase/utils"

import type {
  CheckDoc,
  DefectType,
  DocWithID,
  FaultDoc,
  FirestoreCollectionsMap,
  FullCheck,
  FullDefect,
  IncidentDoc,
  SimplifiedUser
} from "@/globals/firestore/firestore.model"

import type { GeneratedExportFile } from "../exports.model"

export type CheckFilenameData = Pick<CheckDoc, "carId" | "creationTimestamp">

export const getCheckFilenameBase = ({
  carId,
  creationTimestamp
}: CheckFilenameData) =>
  `check-${carId}-${new Date(creationTimestamp).toISOString().slice(0, 10)}`

type GetDefectAttachmentFilenameProps = {
  check: CheckFilenameData
  type: DefectType
  defectNumber: number
  resolutionFileUrl: string
}

export const getDefectAttachmentFilename = ({
  check,
  type,
  defectNumber,
  resolutionFileUrl
}: GetDefectAttachmentFilenameProps) =>
  `${getCheckFilenameBase(check)}-${type}-${defectNumber}${path.extname(resolutionFileUrl)}`

type GetDefectsProps<DefectCollectionId extends DefectType> = {
  check: DocWithID<CheckDoc>
  defectType: DefectCollectionId
}

const getDefects = async <DefectCollectionId extends DefectType>({
  check,
  defectType
}: GetDefectsProps<DefectCollectionId>): Promise<
  DocWithID<FirestoreCollectionsMap[DefectCollectionId]>[]
> => {
  const defectCountField = `${defectType}Count` as keyof CheckDoc

  const hasDefects = !!check[defectCountField]

  if (!hasDefects) {
    return []
  }

  const defects = await getFirestoreDocs({
    collection: defectType,
    queries: [["checkId", "==", check.id]]
  })

  return defects
}

export const getSimplifiedUsersMap = async (usersIds: string[]) => {
  const uniqueUsersIds = Array.from(new Set(usersIds))

  const users = await getFirestoreDocs({
    collection: "users",
    ids: uniqueUsersIds
  })

  // Firestore resolves missing docs to a snapshot holding only an id, so those
  // are dropped here and resolved through the fallback on lookup instead
  return new Map<string, SimplifiedUser>(
    users.flatMap(({ id, firstName, lastName }) =>
      firstName && lastName ? [[id, { id, firstName, lastName }] as const] : []
    )
  )
}

type GetSimplifiedUserProps = {
  usersMap: Map<string, SimplifiedUser>
  userId: string
}
export const getSimplifiedUser = ({
  usersMap,
  userId
}: GetSimplifiedUserProps): SimplifiedUser =>
  usersMap.get(userId) ?? { id: userId, firstName: "Unknown", lastName: "user" }

type BuildFullDefectsProps<Defect extends FaultDoc | IncidentDoc> = {
  defects: DocWithID<Defect>[]
  usersMap: Map<string, SimplifiedUser>
}
export const buildFullDefects = <Defect extends FaultDoc | IncidentDoc>({
  defects,
  usersMap
}: BuildFullDefectsProps<Defect>): DocWithID<FullDefect<Defect>>[] =>
  defects.map(({ driverId, resolutionUserId, ...defect }) => ({
    ...defect,
    driver: getSimplifiedUser({ usersMap, userId: driverId }),
    resolutionUser: resolutionUserId
      ? getSimplifiedUser({ usersMap, userId: resolutionUserId })
      : undefined
  })) as DocWithID<FullDefect<Defect>>[]

export const buildFullCheck = async (check: DocWithID<CheckDoc>) => {
  const [faults, incidents] = await Promise.all([
    getDefects({ check, defectType: "faults" }),
    getDefects({ check, defectType: "incidents" })
  ])

  const { id, driverId, ...remainingCheck } = check

  const defectsUsersIds = [...faults, ...incidents].flatMap(defect =>
    [defect.driverId, defect.resolutionUserId].filter(
      (userId): userId is string => !!userId
    )
  )

  const usersMap = await getSimplifiedUsersMap([driverId, ...defectsUsersIds])

  const fullCheck: FullCheck = {
    ...remainingCheck,
    id,
    driver: getSimplifiedUser({ usersMap, userId: driverId }),
    faults: buildFullDefects({ defects: faults, usersMap }),
    incidents: buildFullDefects({ defects: incidents, usersMap })
  }

  return fullCheck
}

type GetDefectsByCheckIdsProps<Defect extends FaultDoc | IncidentDoc> = {
  checkIds: string[]
  fetchDefects: (
    filter: ["checkId", "in", string[]]
  ) => Promise<DocWithID<Defect>[]>
}

export const getDefectsByCheckIds = async <
  Defect extends FaultDoc | IncidentDoc
>({
  checkIds,
  fetchDefects
}: GetDefectsByCheckIdsProps<Defect>): Promise<
  Map<string, DocWithID<Defect>[]>
> => {
  if (!checkIds.length) {
    return new Map()
  }

  const defects = await fetchDefects(["checkId", "in", checkIds])

  const defectsByCheckId = new Map<string, DocWithID<Defect>[]>()

  defects.forEach(defect => {
    const checkDefects = defectsByCheckId.get(defect.checkId)

    if (checkDefects) {
      checkDefects.push(defect)
    } else {
      defectsByCheckId.set(defect.checkId, [defect])
    }
  })

  return defectsByCheckId
}

type GetDefectsAttachmentsDataProps = {
  defects: Pick<FaultDoc | IncidentDoc, "resolutionFileUrl">[]
  type: DefectType
}

const getDefectsAttachmentsData = ({
  defects,
  type
}: GetDefectsAttachmentsDataProps) =>
  defects.flatMap(({ resolutionFileUrl }, index) =>
    resolutionFileUrl
      ? [{ type, defectNumber: index + 1, resolutionFileUrl }]
      : []
  )

export const getDefectsAttachmentFiles = async ({
  carId,
  creationTimestamp,
  faults,
  incidents
}: FullCheck): Promise<GeneratedExportFile[]> => {
  const faultsAttachmentsData = getDefectsAttachmentsData({
    defects: faults,
    type: "faults"
  })
  const incidentsAttachmentsData = getDefectsAttachmentsData({
    defects: incidents,
    type: "incidents"
  })

  const attachmentsData = [
    ...faultsAttachmentsData,
    ...incidentsAttachmentsData
  ]

  const attachmentsPromises = attachmentsData.map(
    async ({ type, defectNumber, resolutionFileUrl }) => {
      const file = storage.bucket().file(resolutionFileUrl)

      const [exists] = await file.exists()

      if (!exists) {
        return null
      }

      const [metadata] = await file.getMetadata()
      const [buffer] = await file.download()

      return {
        filename: getDefectAttachmentFilename({
          check: { carId, creationTimestamp },
          type,
          defectNumber,
          resolutionFileUrl
        }),
        buffer,
        contentType: metadata.contentType || "application/octet-stream"
      }
    }
  )

  const attachmentFiles = await Promise.all(attachmentsPromises)

  return attachmentFiles.flatMap(file => (file ? [file] : []))
}

export const getCheckFilename = (check: CheckFilenameData) =>
  `${getCheckFilenameBase(check)}.pdf`
