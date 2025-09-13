import { PlusCircleFill, Search } from "react-bootstrap-icons"

import { Input } from "@/components/basic/Input"

import { useDataViewList } from "./useDataViewList"

import { DataCard } from "./DataCard"
import { Filters } from "./Filters"

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
  onAddButtonClick?: () => void
  openEditModal?: OpenEditModal<RawItem>
  deleteItem?: (item: RawItem) => Promise<void>
  fetchItems: FetchItems<RawItem>
}

export const DataView = <RawItem extends RawDataListItem>({
  filtersConfig,
  serverSideFetching = false,
  itemMetadataConfig,
  deleteItem,
  onAddButtonClick,
  openEditModal,
  fetchItems
}: DataViewProps<RawItem>) => {
  const {
    items,
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange,
    onItemDelete,
    onItemEdit
  } = useDataViewList({
    filtersConfig,
    fetchItems,
    serverSideFetching,
    itemMetadataConfig,
    deleteItem,
    openEditModal
  })

  return (
    <div className="h-[calc(100vh-64px)]">
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

        <Input
          label="Search"
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          endAdornment={
            <Search className="fill-primary" width={20} height={20} />
          }
        />

        <Filters filters={filters} onFilterChange={onFilterChange} />
      </div>

      <ul className="p-5 flex flex-wrap gap-10 overflow-y-auto h-fit max-h-full w-full scrollbar">
        {items.map(({ title, subtitle, id, metadata }) => {
          const onEdit = openEditModal ? () => onItemEdit(id) : undefined
          const onDelete = deleteItem ? () => onItemDelete(id) : undefined

          return (
            <DataCard
              key={id}
              title={title}
              subtitle={subtitle}
              metadata={metadata}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )
        })}
      </ul>
    </div>
  )
}
