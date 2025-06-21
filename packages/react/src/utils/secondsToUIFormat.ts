type SecondsToUIFormatArgs = {
  ms: number
  displayFormat: "hh:mm:ss" | "mm:ss" | "ss"
}

export const secondsToUIFormat = ({
  ms,
  displayFormat
}: SecondsToUIFormatArgs) => {
  const totalSeconds = Math.floor(ms / 1000)
  const seconds = (totalSeconds % 60).toString().padStart(2, "0")

  if (displayFormat === "ss") {
    return seconds
  }

  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0")

  if (displayFormat === "mm:ss") {
    return `${minutes}:${seconds}`
  }

  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0")

  return `${hours}:${minutes}:${seconds}`
}
