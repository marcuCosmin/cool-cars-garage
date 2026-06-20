import { fileEntityTypes } from "@/globals/requests/requests.const"
import type { FileEntityType } from "@/globals/requests/requests.model"

export const isValidFileEntityType = (
  value?: string
): value is FileEntityType => fileEntityTypes.includes(value as FileEntityType)
