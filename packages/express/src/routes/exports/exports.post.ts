import { ZipArchive } from "archiver"
import type { NextFunction } from "express"

import type {
  ExportableResources,
  ExportParams,
  ExportPayload
} from "@/globals/requests/requests.model"

import type { Request, Response } from "@/models"

import {
  getContentDisposition,
  isExportableResource,
  validateExportPayload
} from "./utils/exports.utils"

import { exportsConfig } from "./exports.const"

export const handleExport = async (
  req: Request<
    Record<keyof ExportParams, string>,
    Uint8Array,
    ExportPayload<ExportableResources>
  >,
  res: Response<Uint8Array>,
  next: NextFunction
) => {
  const { resourceId } = req.params

  if (!isExportableResource(resourceId)) {
    res.status(400).json({ error: "Invalid resourceId" })
    return
  }

  const config = exportsConfig[resourceId]

  const payload = req.body

  const payloadValidationError = validateExportPayload(payload)

  if (payloadValidationError) {
    res.status(400).json({ error: payloadValidationError })
    return
  }

  const extraValidationError = await config.getExtraValidationError?.(payload)

  if (extraValidationError) {
    res.status(400).json({ error: extraValidationError })
    return
  }

  const files = await config.getFiles(payload)

  if (!files.length) {
    res.status(404).json({
      error: "There are no available records for your selected criteria"
    })

    return
  }

  if (files.length === 1) {
    const [file] = files

    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": getContentDisposition({
        disposition: "inline",
        filename: file.filename
      }),
      "Content-Length": file.buffer.length
    })

    res.send(file.buffer)
    return
  }

  const archive = new ZipArchive()

  archive.on("error", next)

  res.set({
    "Content-Type": "application/zip",
    "Content-Disposition": getContentDisposition({
      disposition: "attachment",
      filename: `${resourceId}-export.zip`
    })
  })

  archive.pipe(res)

  files.forEach(
    ({ filename, buffer: { buffer: arrayBuffer, byteOffset, byteLength } }) => {
      archive.append(Buffer.from(arrayBuffer, byteOffset, byteLength), {
        name: filename
      })
    }
  )

  await archive.finalize()
}
