import { useLocation, useSearchParams } from "react-router"
import { useEffect, useState } from "react"
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData
} from "@tanstack/react-query"

import {
  filtersConfigToState,
  getFilteredItems,
  getFilterField,
  getNextPageParam,
  getQueryKey,
  transformFilterToSearchParam
} from "./DataView.utils"

import type {
  FetchItems,
  FilterChangeHandler,
  FilterItem,
  FiltersConfig,
  FiltersState,
  OpenDataViewModal
} from "./DataView.model"

import { showToast } from "@/utils/showToast"

import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"

type UseDataViewList<
  RawItem extends RawDataListItem,
  Filter extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
> = {
  filtersConfig: FiltersConfig<Filter, ServerSideFetching>
  fetchItems: FetchItems<RawItem, Filter, ServerSideFetching>
  openModal?: OpenDataViewModal<RawItem>
  serverSideFetching: boolean
}

export const useDataViewList = <
  RawItem extends RawDataListItem,
  Filter extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
>({
  filtersConfig,
  fetchItems,
  openModal,
  serverSideFetching
}: UseDataViewList<RawItem, Filter, ServerSideFetching>) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const filters = filtersConfigToState<Filter, ServerSideFetching>({
    filtersConfig,
    searchParams
  })

  const queryClient = useQueryClient()

  const location = useLocation()
  const queryKey = getQueryKey<Filter, ServerSideFetching>({
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
    const filter = { ...filters[index], value } as FiltersState<
      Filter,
      ServerSideFetching
    >[number]

    const filterField = getFilterField<Filter, ServerSideFetching>(
      filtersConfig[index]
    )

    setSearchParams(params => {
      const paramValue = transformFilterToSearchParam<
        Filter,
        ServerSideFetching
      >({
        filter,
        existingSearchParam: params.get(filterField)
      })

      if (!paramValue) {
        params.delete(filterField)
        return params
      }

      params.set(filterField, paramValue)

      return params
    })
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

  useEffect(() => {
    if (!error?.message) {
      return
    }

    showToast({
      type: "error",
      message: `An error occurred while fetching data: ${error?.message}`
    })
  }, [error?.message])

  return {
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
