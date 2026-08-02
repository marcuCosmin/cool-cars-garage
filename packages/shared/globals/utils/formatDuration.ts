export const formatDuration = (durationMs: number) => {
  const totalMinutes = Math.floor(durationMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`
}
