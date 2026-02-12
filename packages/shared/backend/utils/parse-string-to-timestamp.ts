export const parseDateToTimestamp = (dateString: string) => {
  const date = new Date(dateString)
  const timestamp = date.getTime()

  return timestamp
}
