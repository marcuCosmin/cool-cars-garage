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

type GetFilesProps<Resource extends ExportableResources> = {
  payload: ExportPayload<Resource>
  signal: AbortSignal
}

export type GetFiles<Resource extends ExportableResources> = (
  props: GetFilesProps<Resource>
) => Promise<ExportResult>

type GetArchiveNameProps<Resource extends ExportableResources> = {
  payload: ExportPayload<Resource>
  files: GeneratedExportFile[]
}

export type GetArchiveName<Resource extends ExportableResources> = (
  props: GetArchiveNameProps<Resource>
) => string
