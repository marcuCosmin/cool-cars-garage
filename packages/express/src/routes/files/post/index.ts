import { storage } from "@/backend/firebase/config"
import { getFirestoreDoc } from "@/backend/firebase/utils"

import { isValidFileEntityType } from "../utils"

import {
  appendFileToRequest,
  getBufferDetails,
  generateFilePath
} from "./utils"

import type { FileUploadRequest, FileUploadResponse } from "./model"

export const handleFileUpload = async (
  req: FileUploadRequest,
  res: FileUploadResponse
) => {
  const { uploadType, resourceId } = req.query

  if (!isValidFileEntityType(uploadType)) {
    res.status(400).json({ error: "Invalid uploadType" })
    return
  }

  if (!resourceId) {
    res.status(400).json({ error: "resourceId is required" })
    return
  }

  const resource = await getFirestoreDoc({
    collection: uploadType,
    docId: resourceId
  })

  if (!resource) {
    res.status(404).json({ error: "Resource not found" })
    return
  }

  try {
    await appendFileToRequest({ uploadType, req, res })
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : "File upload failed"
    })
    return
  }

  const { file } = req

  if (!file) {
    res.status(400).json({ error: "No file provided" })
    return
  }

  const bufferDetails = await getBufferDetails({
    buffer: file.buffer,
    uploadType
  })

  if (!bufferDetails) {
    res.status(400).json({ error: "Unsupported or invalid file content" })
    return
  }

  const { fileExtension, fileMime } = bufferDetails

  const filePath = generateFilePath({
    uploadType,
    resourceId,
    fileExtension
  })

  await storage
    .bucket()
    .file(filePath)
    .save(file.buffer, { contentType: fileMime })

  res.status(200).json({ filePath })
}
