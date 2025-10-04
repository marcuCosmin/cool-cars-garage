export const getTimestampDayTimeRange = (timestamp?: number) => {
  const date = timestamp ? new Date(timestamp) : new Date()

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return {
    startTimestamp: startOfDay.getTime(),
    endTimestamp: endOfDay.getTime()
  }
}
