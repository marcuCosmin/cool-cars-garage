import { PlusCircleFill, Search } from "react-bootstrap-icons"

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
  GetListItemActionsConfig,
  FilterItem
} from "./DataView.model"

import type { RawDataListItem } from "@/globals/dataLists/dataLists.model"

type DataViewProps<
  RawItem extends RawDataListItem,
  Filter extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
> = {
  getItemActionsConfig?: GetListItemActionsConfig<RawItem>
  itemMetadataConfig: DataListItemMetadataConfig<RawItem>
  filtersConfig: FiltersConfig<Filter, ServerSideFetching>
  serverSideFetching?: ServerSideFetching
  showSearch?: boolean
  fetchItems: FetchItems<RawItem, Filter, ServerSideFetching>
  openModal?: OpenDataViewModal<RawItem>
}

export const DataView = <
  RawItem extends RawDataListItem,
  Filter extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean = false
>({
  filtersConfig,
  serverSideFetching = false as ServerSideFetching,
  itemMetadataConfig,
  showSearch = true,
  getItemActionsConfig,
  openModal,
  fetchItems
}: DataViewProps<RawItem, Filter, ServerSideFetching>) => {
  const {
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

  return (
    <div className="flex flex-col overflow-hidden h-full">
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

      {isLoading ? (
        <Loader className="m-auto" />
      ) : (
        <DataViewList
          itemMetadataConfig={itemMetadataConfig}
          getItemActionsConfig={getItemActionsConfig}
          rawItems={rawItems}
          onScrollEnd={onScrollEnd}
        />
      )}
    </div>
  )
}
