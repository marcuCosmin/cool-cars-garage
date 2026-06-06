import { storage } from "@/backend/firebase/config"

import { appendFileToRequest, generateFilePath } from "./utils"

import type { FileUploadRequest, FileUploadResponse } from "./model"

export const handleFileUpload = async (
  req: FileUploadRequest,
  res: FileUploadResponse
) => {
  const { uploadType, resourceId } = req.query

  if (!uploadType) {
    res.status(400).json({ error: "uploadType is required" })
    return
  }

  if (!resourceId) {
    res.status(400).json({ error: "resourceId is required" })
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

  const file = req.file!
  const fileExtension = file.originalname.split(".").pop()!
  const filePath = generateFilePath({
    uploadType,
    resourceId,
    fileExtension
  })

  await storage
    .bucket()
    .file(filePath)
    .save(file.buffer, { contentType: file.mimetype })

  res.status(200).json({ filePath })
}
