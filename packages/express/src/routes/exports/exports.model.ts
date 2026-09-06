import type {
  ExportableResources,
  ExportPayload,
  ExportWarnings
} from "@/globals/requests/requests.model"

export type GeneratedExportFile = {
  filename: string
  buffer: Uint8Array
  contentType: string
}

export type ExportResult = {
  files: GeneratedExportFile[]
  warnings?: ExportWarnings
}

export type GetFiles<Resource extends ExportableResources> = (
  payload: ExportPayload<Resource>
) => Promise<ExportResult>
