import multer from "multer"
import { randomUUID } from "crypto"

import type { FileEntityType } from "@/globals/requests/requests.model"

import type { FileUploadRequest, FileUploadResponse } from "./model"

type UploadTypeConfig = {
  allowedMimeTypes: string[]
  maxFileSizeBytes: number
}

const defectsUploadConfig: UploadTypeConfig = {
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ],
  maxFileSizeBytes: 10 * 1024 * 1024
}

const uploadTypeConfig: Record<FileEntityType, UploadTypeConfig> = {
  faults: defectsUploadConfig,
  incidents: defectsUploadConfig
}

type AppendFileToRequestProps = {
  uploadType: FileEntityType
  req: FileUploadRequest
  res: FileUploadResponse
}

export const appendFileToRequest = ({
  uploadType,
  req,
  res
}: AppendFileToRequestProps) => {
  const { allowedMimeTypes, maxFileSizeBytes } = uploadTypeConfig[uploadType]

  const multerInstance = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSizeBytes },
    fileFilter: (_req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        callback(
          new Error(
            `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`
          )
        )
        return
      }

      callback(null, true)
    }
  })

  return new Promise<void>((resolve, reject) => {
    const multerMiddleware = multerInstance.single("file")

    const multerErrorHandler = (err: unknown) => {
      if (err) {
        reject(err)
        return
      }

      resolve()
    }

    multerMiddleware(req, res, multerErrorHandler)
  })
}

type GenerateFilePathProps = {
  uploadType: FileEntityType
  resourceId: string
  fileExtension: string
}
export const generateFilePath = ({
  uploadType,
  resourceId,
  fileExtension
}: GenerateFilePathProps) => {
  const randomId = randomUUID()
  const fileName = `${randomId}.${fileExtension}`

  const filePath = `${uploadType}/${resourceId}/${fileName}`

  return filePath
}
