import type {
  FirestoreCollectionsMap,
  User
} from "../firestore/firestore.model"

export type FileEntityType = Extract<
  keyof FirestoreCollectionsMap,
  "faults" | "incidents"
>


export type FileUploadQuery = {
  uploadType: FileEntityType
  resourceId: string
}

export type FileUploadResponse = {
  filePath: string
}

export type FileDownloadQuery = {
  filePath: string
}

export type ResolveFaultParams = {
  faultId: string
}

export type ResolveIncidentParams = {
  incidentId: string
}

export type ResolveDefectResponse = {
  resolutionTimestamp: number
  message: string
}

export type CarsCheckExportURLQuery =
  | {
      checkId: string
      type: "individual"
    }
  | {
      type: "bulk"
      startTimestamp: number
      endTimestamp: number
    }

export type RegisterUserResponse = {
  authToken: string
}

export type ReiniviteUserPayload = Pick<User, "uid">

export type CreateUserResponse = {
  user: User
}

export type DeleteUserQueryParams = Pick<User, "uid">

export type GetUsersResponse = {
  users: User[]
}

export type UserActiveStateUpdatePayload = Pick<User, "uid" | "isActive">
