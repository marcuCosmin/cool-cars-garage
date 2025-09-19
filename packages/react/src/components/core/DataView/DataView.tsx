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
  OpenEditModal
} from "./DataView.model"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

type DataViewProps<RawItem extends RawDataListItem> = {
  itemMetadataConfig: DataListItemMetadataConfig<RawItem>
  filtersConfig: FiltersConfig<RawItem>
  serverSideFetching?: boolean
  itemDetailedViewBasePath?: string
  showSearch?: boolean
  fetchItems: FetchItems<RawItem>
  onAddButtonClick?: () => void
  openEditModal?: OpenEditModal<RawItem>
  deleteItem?: (item: RawItem) => Promise<void>
}

export const DataView = <RawItem extends RawDataListItem>({
  filtersConfig,
  serverSideFetching = false,
  itemMetadataConfig,
  showSearch = true,
  itemDetailedViewBasePath,
  deleteItem,
  onAddButtonClick,
  openEditModal,
  fetchItems
}: DataViewProps<RawItem>) => {
  const {
    error,
    isLoading,
    items,
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onItemDelete,
    onItemEdit,
    onScrollEnd
  } = useDataViewList({
    filtersConfig,
    fetchItems,
    serverSideFetching,
    itemMetadataConfig,
    deleteItem,
    openEditModal
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

      <DataViewList
        itemDetailedViewBasePath={itemDetailedViewBasePath}
        items={items}
        onItemDelete={onItemDelete}
        onItemEdit={onItemEdit}
        onScrollEnd={onScrollEnd}
      />
    </div>
  )
}
