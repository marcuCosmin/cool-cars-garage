import { Timestamp } from "firebase/firestore"

import type {
  FiltersConfig,
  FiltersState,
  DefaultDataItem
} from "./DataView.model"
import type { FieldValue } from "../../../models"

export const parseSearchString = (searchString: string) =>
  searchString.trim().toLowerCase()

export const filtersConfigToState = <DataItem extends DefaultDataItem>(
  filtersConfig: FiltersConfig<DataItem>
): FiltersState<DataItem> =>
  filtersConfig.map(filterProps => {
    const { type } = filterProps

    switch (type) {
      case "select": {
        return {
          ...filterProps,
          value: [] as string[]
        }
      }
      case "toggle": {
        return {
          ...filterProps,
          value: false
        }
      }
    }
  })

export const fieldValueToString = (value: FieldValue): string => {
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString()
  }

  if (typeof value === "string") {
    return value
  }

  return String(value)
}
