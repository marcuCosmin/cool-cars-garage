import { parseTimestampForDisplay } from "@/globals/utils/parseTimestampForDisplay"

import { formatDuration } from "@/utils/formatDuration"

import type { PrimitiveMetadata } from "../../DataView.model"

export const getParsedItemMetadataValue = ({
  type,
  value
}: PrimitiveMetadata) => {
  if (value === null || value === undefined) {
    return null
  }

  switch (type) {
    case "text":
      return value
    case "boolean":
      return value ? "Yes" : "No"
    case "date":
      return parseTimestampForDisplay(value)
    case "duration":
      return formatDuration(value)
    case "link":
      return value
    default:
      return null
  }
}
