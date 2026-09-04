import type {
  ExportableResources,
  ExportParams,
  SearchPayload
} from "@/globals/requests/requests.model"

import { exportsConfig } from "../exports.const"

export const validateExportPayload = ({
  filters,
  cap,
  order
}: Partial<SearchPayload<ExportParams["resourceId"], "__name__">>) => {
  if (filters && !Array.isArray(filters)) {
    return "Invalid filters provided"
  }

  if (cap !== undefined && typeof cap !== "number") {
    return "Search cap must be a number"
  }

  if (order) {
    if (typeof order !== "object") {
      return "Invalid order property provided"
    }

    const { field, direction } = order

    if (!field || typeof field !== "string") {
      return "The 'field' for the order property is invalid"
    }

    if (direction !== "asc" && direction !== "desc") {
      return "The 'direction' for the order property is invalid"
    }
  }
}

type GetContentDispositionProps = {
  disposition: "inline" | "attachment"
  filename: string
}

const encodeExtValue = (value: string) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  )

export const getContentDisposition = ({
  disposition,
  filename
}: GetContentDispositionProps) =>
  `${disposition}; filename*=UTF-8''${encodeExtValue(filename)}`

export const isExportableResource = (
  resourceId: string
): resourceId is ExportableResources => resourceId in exportsConfig
