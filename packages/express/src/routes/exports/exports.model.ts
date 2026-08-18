import type {
  ExportableResources,
  ExportPayload
} from "@/globals/requests/requests.model"

export type GeneratedExportFile = {
  filename: string
  buffer: Uint8Array
  contentType: string
}

export type GetFiles<Resource extends ExportableResources> = (
  payload: ExportPayload<Resource>
) => Promise<GeneratedExportFile[]>
