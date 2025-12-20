import { useLocation } from "react-router"
import { useState } from "react"
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData
} from "@tanstack/react-query"

import { type DocumentData } from "firebase/firestore"

import {
  filtersConfigToState,
  getFilteredItems,
  getNextPageParam,
  getQueryKey
} from "./DataView.utils"

import type {
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
  serverSideFetching: boolean
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
  openModal,
  serverSideFetching
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

  const onAddSuccess = (newItem: RawItem) => {
    queryClient.setQueriesData(
      {
        queryKey: [location.pathname],
        exact: false
      },
      (data: InfiniteData<RawItem[]>) => {
        const firstPage = data.pages[0] || []
        const otherPages = data.pages.slice(1)

        return {
          ...data,
          pages: [[newItem, ...firstPage], ...otherPages]
        }
      }
    )
  }

  const onAddButtonClick = () => openModal?.({ onSuccess: onAddSuccess })

  return {
    error,
    isLoading: isFetching && !isFetchingNextPage,
    isLoadingNextChunk: isFetchingNextPage,
    rawItems: filteredRawItems,
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onScrollEnd: serverSideFetching ? fetchNextPage : undefined,
    onAddButtonClick: openModal ? onAddButtonClick : undefined
  }
}
