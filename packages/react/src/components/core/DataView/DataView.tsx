import { PlusCircleFill, Search } from "react-bootstrap-icons"

import { Input } from "@/components/basic/Input"

import { useDataViewList } from "./useDataViewList"

import { DataCard } from "./DataCard"
import { Filters } from "./Filters"

import type { FiltersConfig, DefaultDataItem } from "./DataView.model"

type DataViewProps<DataItem extends DefaultDataItem> = {
  initialData: DataItem[]
  filtersConfig: FiltersConfig<DataItem>
  onAddButtonClick: () => void
  onItemEdit: (id: string) => void
  onItemDelete: (id: string) => Promise<void>
}

export const DataView = <DataItem extends DefaultDataItem>({
  filtersConfig,
  initialData,
  onItemDelete,
  onAddButtonClick,
  onItemEdit
}: DataViewProps<DataItem>) => {
  const { items, searchQuery, onSearchChange, filters, onFilterChange } =
    useDataViewList({ initialData, filtersConfig })

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="p-5 flex flex-wrap items-end gap-5">
        <button
          className="w-fit h-fit bg-transparent border-0 p-0 text-primary ring-0"
          type="button"
          onClick={onAddButtonClick}
        >
          <PlusCircleFill size={40} />
        </button>

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
        {items.map(({ title, badge, id, ...itemProps }) => {
          const onEdit = () => onItemEdit(id)
          const onDelete = () => onItemDelete(id)

          return (
            <DataCard
              onDelete={onDelete}
              onEdit={onEdit}
              title={title}
              badge={badge}
              key={id}
              fieldsData={itemProps}
            />
          )
        })}
      </ul>
    </div>
  )
}
