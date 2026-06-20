import type { Response } from "express"

import { storage } from "@/backend/firebase/config"

import type { FileDownloadQuery } from "@/globals/requests/requests.model"

import type { Request } from "@/models"

import { parseFilePath } from "./utils"

export const handleFileDownload = async (
  req: Request<undefined, undefined, undefined, Partial<FileDownloadQuery>>,
  res: Response
) => {
  const parsedPath = parseFilePath(req.query.filePath)

  if (!parsedPath) {
    res.status(400).json({ error: "Invalid file path" })
    return
  }

  const { uploadType, resourceId, fileName } = parsedPath
  const file = storage.bucket().file(`${uploadType}/${resourceId}/${fileName}`)

  const [exists] = await file.exists()

  if (!exists) {
    res.status(404).json({ error: "File not found" })
    return
  }

  const [metadata] = await file.getMetadata()

  res.setHeader(
    "Content-Type",
    metadata.contentType || "application/octet-stream"
  )
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("Content-Disposition", "inline")

  file
    .createReadStream()
    .on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to read file" })
      }
    })
    .pipe(res)
}
