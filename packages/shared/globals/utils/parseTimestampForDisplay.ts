type ParseTimestampForDisplayProps = {
  timestamp: number
  includeTime?: boolean
}

export const parseTimestampForDisplay = ({
  timestamp,
  includeTime = true
}: ParseTimestampForDisplayProps) => {
  const date = new Date(timestamp)

  let options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }

  if (includeTime) {
    options = {
      ...options,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }
  }

  return date.toLocaleDateString("en-GB", options)
}
