import { useEffect, useState } from "react"

import { filtersConfigToState, parseSearchString } from "./DataView.utils"

import type {
  DefaultDataItem,
  FilterChangeHandler,
  FiltersConfig,
  FiltersState
} from "./DataView.model"

type UseDataViewList<DataItem extends DefaultDataItem> = {
  initialData: DataItem[]
  filtersConfig: FiltersConfig<DataItem>
}

export const useDataViewList = <DataItem extends DefaultDataItem>({
  initialData,
  filtersConfig
}: UseDataViewList<DataItem>) => {
  const [items, setItems] = useState(initialData)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState(filtersConfigToState(filtersConfig))

  const onFilterChange: FilterChangeHandler = ({ value, index }) => {
    const newFilters = filters.slice()

    newFilters[index] = {
      ...newFilters[index],
      value
    } as FiltersState<DataItem>[number]

    setFilters(newFilters)
  }

  const onSearchChange = (searchQuery: string = "") =>
    setSearchQuery(searchQuery)

  useEffect(() => {
    let newData = initialData.slice()
    const parsedSearchQuery = parseSearchString(searchQuery)

    if (parsedSearchQuery) {
      newData = newData.filter(item => {
        const parsedTitle = parseSearchString(item.title)
        const parsedSubtitle = parseSearchString(item.badge)

        return (
          parsedTitle.includes(parsedSearchQuery) ||
          parsedSubtitle.includes(parsedSearchQuery)
        )
      })
    }

    filters.forEach(filter => {
      const { type } = filter

      if (type === "toggle") {
        const { filterFn, value } = filter

        if (!value) {
          return
        }

        newData = newData.filter(filterFn)
        return
      }

      const { value, field } = filter

      if (value.length === 0) {
        return
      }

      newData = newData.filter(item => {
        const itemValue = item[field as keyof typeof item]

        return value.some(v => v === itemValue)
      })
    })

    setItems(newData)
  }, [initialData, searchQuery, filters])

  return { items, searchQuery, onSearchChange, filters, onFilterChange }
}
