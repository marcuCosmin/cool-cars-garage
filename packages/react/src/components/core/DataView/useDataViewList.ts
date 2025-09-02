import { useEffect, useState } from "react"

import { filtersConfigToState, parseSearchString } from "./DataView.utils"

import type {
  DataListItem,
  FilterChangeHandler,
  FiltersConfig,
  FiltersState
} from "./DataView.model"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

type UseDataViewList<RawItem extends RawDataListItem> = {
  data: DataListItem<RawItem>[]
  filtersConfig: FiltersConfig<RawItem>
}

export const useDataViewList = <RawItem extends RawDataListItem>({
  data,
  filtersConfig
}: UseDataViewList<RawItem>) => {
  const [items, setItems] = useState(data)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState(filtersConfigToState(filtersConfig))

  const onFilterChange: FilterChangeHandler = ({ value, index }) => {
    const newFilters = filters.slice()

    newFilters[index] = {
      ...newFilters[index],
      value
    } as FiltersState<RawItem>[number]

    setFilters(newFilters)
  }

  const onSearchChange = (searchQuery: string = "") =>
    setSearchQuery(searchQuery)

  useEffect(() => {
    let newData = data.slice()
    const parsedSearchQuery = parseSearchString(searchQuery)

    if (parsedSearchQuery) {
      newData = newData.filter(item => {
        const parsedTitle = parseSearchString(item.title)
        const parsedSubtitle = parseSearchString(item.subtitle)

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
        const itemMetadata = item.metadata[field]

        return value.some(v => v === itemMetadata.value)
      })
    })

    setItems(newData)
  }, [data, searchQuery, filters])

  return { items, searchQuery, onSearchChange, filters, onFilterChange }
}
