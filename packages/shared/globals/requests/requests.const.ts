import type { FileEntityType } from "./requests.model"

export const fileUploadFieldName = "file" as const

export const fileEntityTypes: readonly FileEntityType[] = ["faults", "incidents"]
