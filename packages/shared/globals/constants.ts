export const taxiCouncils = ["Cornwall", "Wolverhampton", "Portsmouth"] as const
export type TaxiCouncil = (typeof taxiCouncils)[number]

export const councils = ["PSV", ...taxiCouncils, "Other"] as const

export type Council = (typeof councils)[number]

export const reportsQuestionsSections = [
  "interior",
  "exterior",
  "driver"
] as const
