import { useLocation } from "react-router"
import { useState } from "react"
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData
} from "@tanstack/react-query"

import { type DocumentData } from "firebase/firestore"

import {
  extendDataListItems,
  filtersConfigToState,
  getFilteredItems,
  getNextPageParam,
  getQueryKey
} from "./DataView.utils"

import type {
  DataListItemMetadataConfig,
  FetchItems,
  FilterChangeHandler,
  FiltersConfig,
  FiltersState,
  OpenDataViewModal
} from "./DataView.model"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

type UseDataViewList<
  RawItem extends RawDataListItem,
  FilterItem extends ServerSideFetching extends true
    ? DocumentData
    : RawDataListItem,
  ServerSideFetching extends boolean
> = {
  filtersConfig: FiltersConfig<FilterItem, ServerSideFetching>
  fetchItems: FetchItems<RawItem, FilterItem, ServerSideFetching>
  openModal?: OpenDataViewModal<RawItem>
  deleteItem?: (item: RawItem) => Promise<void>
  serverSideFetching: boolean
  itemMetadataConfig: DataListItemMetadataConfig<RawItem>
}

export const useDataViewList = <
  RawItem extends RawDataListItem,
  FilterItem extends ServerSideFetching extends true
    ? DocumentData
    : RawDataListItem,
  ServerSideFetching extends boolean
>({
  filtersConfig,
  fetchItems,
  deleteItem,
  openModal,
  serverSideFetching,
  itemMetadataConfig
}: UseDataViewList<RawItem, FilterItem, ServerSideFetching>) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState(filtersConfigToState(filtersConfig))
  const queryClient = useQueryClient()

  const location = useLocation()
  const queryKey = getQueryKey<FilterItem, ServerSideFetching>({
    queryName: location.pathname,
    searchQuery,
    filters,
    serverSideFetching: serverSideFetching as ServerSideFetching
  })

  const { isFetching, data, isFetchingNextPage, fetchNextPage, error } =
    useInfiniteQuery({
      queryKey,
      queryFn: fetchItems,
      initialPageParam: undefined,
      getNextPageParam
    })

  const rawItems = data ? data.pages.flat() : []

  const filteredRawItems = !serverSideFetching
    ? getFilteredItems<RawItem>({
        items: rawItems,
        searchQuery,
        filters: filters as FiltersState<RawItem, false>
      })
    : rawItems

  const items = extendDataListItems({
    items: filteredRawItems,
    metadataConfig: itemMetadataConfig
  })

  const onFilterChange: FilterChangeHandler = ({ value, index }) => {
    const newFilters = filters.slice() as FiltersState<
      FilterItem,
      ServerSideFetching
    >

    newFilters[index] = {
      ...newFilters[index],
      value
    } as FiltersState<FilterItem, ServerSideFetching>[number]

    setFilters(newFilters)
  }

  const onSearchChange = (searchQuery: string = "") =>
    setSearchQuery(searchQuery)

  const onItemDelete = async (id: RawItem["id"]) => {
    const rawItem = rawItems.find(item => item.id === id)

    if (!rawItem) {
      return
    }

    const response = await deleteItem?.(rawItem)

    queryClient.setQueriesData(
      {
        queryKey: [location.pathname],
        exact: false
      },
      (data: InfiniteData<RawItem>) => {
        const newData = data.pages.slice()
        const itemIndex = newData.findIndex(item => item.id === id)

        if (itemIndex !== -1) {
          newData.splice(itemIndex, 1)
        }

        return {
          ...data,
          pages: newData
        }
      }
    )

    return response
  }

  const onEditSuccess = (newItem: RawItem) => {
    queryClient.setQueriesData(
      {
        queryKey: [location.pathname],
        exact: false
      },
      (data: RawItem[]) => {
        const newData = data.slice()
        const itemIndex = newData.findIndex(item => item.id === newItem.id)

        if (itemIndex !== -1) {
          newData[itemIndex] = newItem
        }

        return newData
      }
    )
  }

  const onItemEdit = (id: RawItem["id"]) => {
    const rawItem = rawItems.find(item => item.id === id)

    if (!rawItem) {
      return
    }

    openModal?.({ item: rawItem, onSuccess: onEditSuccess })
  }

  const onAddSuccess = (newItem: RawItem) => {
    queryClient.setQueriesData(
      {
        queryKey: [location.pathname],
        exact: false
      },
      (data: InfiniteData<RawItem[]>) => ({
        ...data,
        pages: [...data.pages, newItem]
      })
    )
  }

  const onAddButtonClick = () => openModal?.({ onSuccess: onAddSuccess })

  return {
    error,
    isLoading: isFetching && !isFetchingNextPage,
    isLoadingNextChunk: isFetchingNextPage,
    items,
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onScrollEnd: serverSideFetching ? fetchNextPage : undefined,
    onItemDelete: deleteItem ? onItemDelete : undefined,
    onItemEdit: openModal ? onItemEdit : undefined,
    onAddButtonClick: openModal ? onAddButtonClick : undefined
  }
}
