import { Timestamp } from "firebase/firestore"

import type { Data, FiltersConfig, FiltersState } from "./model"
import type { FieldValue } from "../../../models"

export const dataToArray = (data: Data) =>
  Object.entries(data).map(([key, value]) => ({
    ...value,
    id: key
  }))

export const filtersConfigToState = (
  filtersConfig: FiltersConfig
): FiltersState =>
  Object.entries(filtersConfig).reduce((acc, [label, filterProps]) => {
    const { type } = filterProps

    switch (type) {
      case "select": {
        return {
          ...acc,
          [label]: {
            ...filterProps,
            value: []
          }
        }
      }
      case "toggle": {
        return {
          ...acc,
          [label]: { ...filterProps, value: false }
        }
      }
      default:
        throw new Error(`Unknown filter type: ${type}`)
    }
  }, {})

export const fieldValueToString = (value: FieldValue): string => {
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString()
  }

  if (typeof value === "string") {
    return value
  }

  return String(value)
}
