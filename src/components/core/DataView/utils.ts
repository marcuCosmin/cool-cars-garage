import type { Data, FiltersConfig } from "./model"

export const dataToArray = (data: Data) =>
  Object.entries(data).map(([key, value]) => ({
    ...value,
    id: key
  }))

export const filtersConfigToState = (filtersConfig: FiltersConfig) =>
  Object.entries(filtersConfig).reduce(
    (acc, [label, fn]) => ({
      ...acc,
      [label]: { active: false, fn }
    }),
    {}
  )
