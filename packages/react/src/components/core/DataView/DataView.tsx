import { PlusCircleFill, Search } from "react-bootstrap-icons"

import { type DocumentData } from "firebase/firestore"

import { Input } from "@/components/basic/Input"
import { Loader } from "@/components/basic/Loader"

import { useDataViewList } from "./useDataViewList"

import { DataViewFilters } from "./DataViewFilters"
import { DataViewList } from "./DataViewList/DataViewList"

import type {
  FiltersConfig,
  FetchItems,
  DataListItemMetadataConfig,
  OpenDataViewModal,
  GetListItemActionsConfig
} from "./DataView.model"

import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"

type DataViewProps<
  RawItem extends RawDataListItem,
  FilterItem extends ServerSideFetching extends true
    ? DocumentData
    : RawDataListItem,
  ServerSideFetching extends boolean
> = {
  getItemActionsConfig?: GetListItemActionsConfig<RawItem>
  itemMetadataConfig: DataListItemMetadataConfig<RawItem>
  filtersConfig: FiltersConfig<FilterItem, ServerSideFetching>
  serverSideFetching?: ServerSideFetching
  showSearch?: boolean
  fetchItems: FetchItems<RawItem, FilterItem, ServerSideFetching>
  openModal?: OpenDataViewModal<RawItem>
}

export const DataView = <
  RawItem extends RawDataListItem,
  FilterItem extends ServerSideFetching extends true
    ? DocumentData
    : RawDataListItem,
  ServerSideFetching extends boolean = false
>({
  filtersConfig,
  serverSideFetching = false as ServerSideFetching,
  itemMetadataConfig,
  showSearch = true,
  getItemActionsConfig,
  openModal,
  fetchItems
}: DataViewProps<RawItem, FilterItem, ServerSideFetching>) => {
  const {
    error,
    isLoading,
    rawItems,
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onScrollEnd,
    onAddButtonClick
  } = useDataViewList({
    filtersConfig,
    fetchItems,
    serverSideFetching,
    openModal
  })

  if (isLoading) {
    return <Loader enableOverlay />
  }

  if (error) {
    return (
      <div className="text-xl mt-10 max-w-5xl font-bold m-auto break-all">
        {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="p-5 flex flex-wrap items-end gap-5">
        {onAddButtonClick && (
          <button
            className="w-fit h-fit bg-transparent border-0 p-0 text-primary ring-0"
            type="button"
            onClick={onAddButtonClick}
          >
            <PlusCircleFill size={40} />
          </button>
        )}

        {showSearch && (
          <Input
            label="Search"
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            endAdornment={
              <Search className="fill-primary" width={20} height={20} />
            }
          />
        )}

        <DataViewFilters filters={filters} onFilterChange={onFilterChange} />
      </div>

      <hr className="w-[95%] sm:w-[98%] mx-auto my-5" />

      <DataViewList
        itemMetadataConfig={itemMetadataConfig}
        getItemActionsConfig={getItemActionsConfig}
        rawItems={rawItems}
        onScrollEnd={onScrollEnd}
      />
    </div>
  )
}
