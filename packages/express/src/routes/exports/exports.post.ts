import { ZipArchive } from "archiver"
import type { NextFunction } from "express"

import type {
  ExportableResources,
  ExportParams,
  ExportPayload
} from "@/globals/requests/requests.model"

import { exportWarningsHeader } from "@/globals/requests/requests.const"

import type { Request, Response } from "@/models"

import { createClientAbortSignal } from "@/utils/create-client-abort-signal"

import {
  encodeExportWarnings,
  getContentDisposition,
  isExportableResource,
  validateExportPayload
} from "./utils/exports.utils"

import type { ExportResult } from "./exports.model"

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

  const signal = createClientAbortSignal(res)

  let exportResult: ExportResult

  try {
    exportResult = await config.getFiles({ payload, signal })
  } catch (error) {
    if (signal.aborted) {
      return
    }

    throw error
  }

  if (signal.aborted) {
    return
  }

  const { files, warnings } = exportResult

  if (warnings) {
    res.set(exportWarningsHeader, encodeExportWarnings(warnings))
  }

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
      filename: `${config.getArchiveName({ payload, files })}.zip`
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
