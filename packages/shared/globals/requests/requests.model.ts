import type {
  FirestoreCollectionsMap,
  FirestoreCollectionsNames,
  User
} from "../firestore/firestore.model"

export type SearchQueriesOperators =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "in"
  | "not-in"
  | "array-contains-any"

export type SearchFilter<
  Doc extends FirestoreCollectionsMap[FirestoreCollectionsNames]
> = {
  [DocProp in keyof Doc & string]:
    | [DocProp, "==" | "!=" | "<" | "<=" | ">" | ">=", Doc[DocProp]]
    | [DocProp, "in" | "not-in", Doc[DocProp][]]
    | [
        DocProp,
        "array-contains",
        Doc[DocProp] extends readonly (infer PropItemValue)[]
          ? PropItemValue
          : never
      ]
    | [
        DocProp,
        "array-contains-any",
        Doc[DocProp] extends readonly (infer PropItemValue)[]
          ? PropItemValue[]
          : never
      ]
}[keyof Doc & string]

export type SearchPayload<CollectionId extends FirestoreCollectionsNames> = {
  collectionId: CollectionId
  filters?: SearchFilter<FirestoreCollectionsMap[CollectionId]>[]
  cap?: number
  order?: {
    field: keyof FirestoreCollectionsMap[CollectionId] & string
    direction: "asc" | "desc"
  }
}

export type SearchPayloads = {
  [CollectionId in FirestoreCollectionsNames]: SearchPayload<CollectionId>
}[FirestoreCollectionsNames]

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
