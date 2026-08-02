import path from "path"

import type {
  ExportParams,
  SearchPayload
} from "@/globals/requests/requests.model"

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

export const getUniqueFilenameGetter = () => {
  const filenameCounts = new Map<string, number>()

  return (filename: string) => {
    const count = (filenameCounts.get(filename) ?? 0) + 1

    filenameCounts.set(filename, count)

    if (count === 1) {
      return filename
    }

    const extension = path.extname(filename)
    const filenameBase = filename.slice(0, filename.length - extension.length)

    return `${filenameBase}-${count}${extension}`
  }
}
