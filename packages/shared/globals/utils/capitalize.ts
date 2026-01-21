export const capitalize = (str: string) => {
  const firstLetter = str[0].toUpperCase()
  const remainingString = str.slice(1)

  return `${firstLetter}${remainingString}`
}
