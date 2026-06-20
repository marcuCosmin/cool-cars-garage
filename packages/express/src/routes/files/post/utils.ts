import multer from "multer"
import { randomUUID } from "crypto"
import { fileTypeFromBuffer } from "file-type"

import type { FileEntityType } from "@/globals/requests/requests.model"
import { fileUploadFieldName } from "@/globals/requests/requests.const"

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

type GetBufferDetails = {
  buffer: Buffer
  uploadType: FileEntityType
}
export const getBufferDetails = async ({
  buffer,
  uploadType
}: GetBufferDetails) => {
  const { allowedMimeTypes } = uploadTypeConfig[uploadType]
  const fileType = await fileTypeFromBuffer(buffer)

  if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
    return null
  }

  return {
    fileMime: fileType.mime,
    fileExtension: fileType.ext
  }
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
  const { maxFileSizeBytes } = uploadTypeConfig[uploadType]

  const multerInstance = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSizeBytes }
  })

  return new Promise<void>((resolve, reject) => {
    const multerMiddleware = multerInstance.single(fileUploadFieldName)

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
