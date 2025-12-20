import { type DocumentData } from "firebase/firestore"

import type {
  DefaultDataListItemCollapsibleMetadataValue,
  RawDataListItem
} from "@/shared/dataLists/dataLists.model"

import type {
  FiltersConfig,
  FiltersState,
  ItemMetadata,
  DataListItemMetadataConfig,
  DataListItem,
  ItemCollapsibleMetadata,
  PrimitiveMetadata
} from "./DataView.model"

export const parseSearchString = (searchString: string) =>
  searchString.trim().toLowerCase()

export const filtersConfigToState = <
  FilterItem extends ServerSideFetching extends true
    ? DocumentData
    : RawDataListItem,
  ServerSideFetching extends boolean
>(
  filtersConfig: FiltersConfig<FilterItem, ServerSideFetching>
): FiltersState<FilterItem, ServerSideFetching> =>
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
      case "date": {
        return {
          ...filterProps,
          value: undefined
        }
      }
    }
  }) as FiltersState<FilterItem, ServerSideFetching>

type ExtendRawItemMetadata<RawItem extends RawDataListItem> = {
  rawMetadata: RawItem["metadata"]
  metadataConfig: DataListItemMetadataConfig<RawItem>
}

export const extendRawItemMetadata = <RawItem extends RawDataListItem>({
  rawMetadata,
  metadataConfig
}: ExtendRawItemMetadata<RawItem>) => {
  const extendedMetadata = Object.entries(rawMetadata).reduce(
    (acc, [key, value]) => {
      const castedKey = key as keyof DataListItemMetadataConfig<RawItem>
      const config = metadataConfig[castedKey]

      if (config.type === "collapsible") {
        const fields = (
          value as DefaultDataListItemCollapsibleMetadataValue
        ).map(field => {
          const extendedField = Object.entries(field).reduce(
            (fieldAcc, [fieldKey, fieldValue]) => {
              const fieldConfig = config.fields[fieldKey]

              fieldAcc[fieldKey] = {
                ...fieldConfig,
                value: fieldValue
              } as PrimitiveMetadata

              return fieldAcc
            },
            {} as ItemCollapsibleMetadata["fields"][number]
          )

          return extendedField
        })

        acc[castedKey] = {
          ...config,
          fields
        } as ItemMetadata

        return acc
      }

      acc[castedKey] = { ...config, value } as ItemMetadata

      return acc
    },
    {} as DataListItem<RawItem>["metadata"]
  )

  return extendedMetadata
}

type GetQueryKeyProps<
  Item extends ServerSideFetching extends true ? DocumentData : RawDataListItem,
  ServerSideFetching extends boolean
> = {
  queryName: string
  searchQuery: string
  filters: FiltersState<Item, ServerSideFetching>
  serverSideFetching: ServerSideFetching
}

export const getQueryKey = <
  Item extends ServerSideFetching extends true ? DocumentData : RawDataListItem,
  ServerSideFetching extends boolean
>({
  queryName,
  searchQuery,
  filters,
  serverSideFetching
}: GetQueryKeyProps<Item, ServerSideFetching>) => {
  if (serverSideFetching) {
    return [queryName, searchQuery, filters]
  }

  return [queryName]
}

export const getNextPageParam = <RawItem extends RawDataListItem>(
  result: RawItem[] | undefined[]
) => {
  const lastItem = result[result.length - 1]

  if (!lastItem) {
    return undefined
  }

  const pageParam = lastItem.metadata.creationTimestamp

  return pageParam
}

type GetItemsBySearchQueryProps<RawItem extends RawDataListItem> = {
  items: RawItem[]
  searchQuery: string
}

const getItemsBySearchQuery = <RawItem extends RawDataListItem>({
  items,
  searchQuery
}: GetItemsBySearchQueryProps<RawItem>) => {
  const parsedSearchQuery = parseSearchString(searchQuery)

  if (!parsedSearchQuery) {
    return items
  }

  const filteredItems = items.filter(item => {
    const parsedTitle = parseSearchString(item.title)
    const parsedSubtitle = parseSearchString(item.subtitle)

    return (
      parsedTitle.includes(parsedSearchQuery) ||
      parsedSubtitle.includes(parsedSearchQuery)
    )
  })

  return filteredItems
}

type GetItemsByFiltersProps<RawItem extends RawDataListItem> = {
  items: RawItem[]
  filters: FiltersState<RawItem, false>
}

const getItemsByFilters = <RawItem extends RawDataListItem>({
  items,
  filters
}: GetItemsByFiltersProps<RawItem>) => {
  let filteredItems = items.slice()

  filters.forEach(filter => {
    const { type } = filter

    if (type === "toggle") {
      const { filterOptions, value } = filter

      if (!value) {
        return
      }

      filteredItems = filteredItems.filter(item => {
        const filterFieldValue = (item.metadata as RawItem["metadata"])[
          filterOptions.field
        ]

        const filterExpression = [
          String(filterFieldValue),
          filterOptions.operator,
          filterOptions.value
        ].join(" ")

        const isMatch = eval(filterExpression)

        return isMatch
      })
      return
    }

    if (type === "select") {
      const { value, field } = filter

      if (!value.length) {
        return
      }

      filteredItems = filteredItems.filter(item => {
        const itemMetadata = (item.metadata as RawItem["metadata"])[field]

        return value.some(v => v === itemMetadata)
      })
    }

    if (type === "date") {
      const { field, operator, value } = filter

      if (!value) {
        return
      }

      filteredItems = filteredItems.filter(item => {
        const itemMetadata = (item.metadata as RawItem["metadata"])[field]

        const filterExpression = [
          String(itemMetadata),
          operator,
          String(value)
        ].join(" ")

        const isMatch = eval(filterExpression)

        return isMatch
      })
    }
  })

  return filteredItems
}

type GetFilteredItemsProps<RawItem extends RawDataListItem> = {
  items: RawItem[]
  searchQuery: string
  filters: FiltersState<RawItem, false>
}

export const getFilteredItems = <RawItem extends RawDataListItem>({
  items,
  searchQuery,
  filters
}: GetFilteredItemsProps<RawItem>) => {
  const itemsBySearchQuery = getItemsBySearchQuery({ items, searchQuery })
  const itemsByFilters = getItemsByFilters({
    items: itemsBySearchQuery,
    filters
  })

  return itemsByFilters
}
