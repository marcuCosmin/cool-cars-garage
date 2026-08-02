import type {
  ExportableResources,
  ExportPayload
} from "@/globals/requests/requests.model"

export type GeneratedExportFile = {
  filename: string
  buffer: Uint8Array
  contentType: string
}

export type GetFilesProps<Resource extends ExportableResources> = {
  payload: ExportPayload<Resource>
}

export type GetFiles<Resource extends ExportableResources> = (
  props: GetFilesProps<Resource>
) => Promise<GeneratedExportFile[]>
