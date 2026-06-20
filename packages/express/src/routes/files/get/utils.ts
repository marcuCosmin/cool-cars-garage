import type { FileEntityType } from "@/globals/requests/requests.model"

import { isValidFileEntityType } from "../utils"

type FilePathParts = {
  uploadType: FileEntityType
  resourceId: string
  fileName: string
}

export const parseFilePath = (filePath?: string): FilePathParts | null => {
  const [uploadType, resourceId, fileName, ...rest] = filePath?.split("/") || []

  if (
    rest.length ||
    !isValidFileEntityType(uploadType) ||
    !resourceId ||
    !fileName
  ) {
    return null
  }

  return { uploadType, resourceId, fileName }
}
