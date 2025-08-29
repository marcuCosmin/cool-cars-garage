export const keyToLabel = (key: string): string => {
  const spacedKey = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()

  return spacedKey.charAt(0).toUpperCase() + spacedKey.slice(1)
}
