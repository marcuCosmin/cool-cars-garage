export const councils = [
  "PSV",
  "Cornwall",
  "Wolverhampton",
  "Portsmouth",
  "Other"
] as const

export type Council = (typeof councils)[number]
