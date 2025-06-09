import { useEffect, useState } from "react"
import { PlusCircleFill, Search } from "react-bootstrap-icons"

import { Input } from "../../basic/Input"
import { ItemCard } from "./ItemCard"
import { Filters } from "./Filters"

import { dataToArray, filtersConfigToState } from "./utils"
import { parseSearchString } from "../../../utils/string"

import type { FiltersConfig, FiltersState, Data } from "./model"

type DataViewProps = {
  initialData: Data
  filtersConfig: FiltersConfig
  onAddButtonClick: () => void
  onItemEdit: (id: string) => void
  onItemDelete: (id: string) => Promise<string | undefined> | string | undefined
}

export const DataView = ({
  filtersConfig,
  initialData,
  onItemDelete,
  onAddButtonClick,
  onItemEdit
}: DataViewProps) => {
  const [data, setData] = useState(dataToArray(initialData))
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FiltersState>(
    filtersConfigToState(filtersConfig)
  )

  const onFilterToggle = (label: string) => {
    const filter = filters[label]

    setFilters({
      ...filters,
      [label]: { ...filter, active: !filter.active }
    })
  }

  const onSearchChange = (searchQuery: string = "") =>
    setSearchQuery(searchQuery)

  useEffect(() => {
    let newData = dataToArray(initialData)
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

    Object.values(filters).forEach(({ active, fn }) => {
      if (!active) {
        return
      }

      newData = newData.filter(fn)
    })

    setData(newData)
  }, [initialData, searchQuery, filters])

  return (
    <div className="p-5">
      <div className="flex items-center mb-5">
        <button
          className="w-fit h-fit bg-transparent border-0 p-0"
          type="button"
          onClick={onAddButtonClick}
        >
          <PlusCircleFill
            className="fill-primary dark:fill-secondary rounded-full"
            width={40}
            height={40}
          />
        </button>

        <Input
          className="max-w-xs ml-5"
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={onSearchChange}
          endAdornment={<Search width={20} height={20} />}
        />

        <Filters filters={filters} onFilterToggle={onFilterToggle} />
      </div>

      <ul className="flex flex-wrap gap-10">
        {data.map(({ title, subtitle, id, ...itemProps }) => {
          const onEdit = () => onItemEdit(id)
          const onDelete = () => onItemDelete(id)

          return (
            <ItemCard
              onDelete={onDelete}
              onEdit={onEdit}
              title={title}
              subtitle={subtitle}
              key={id}
              fieldsData={itemProps}
            />
          )
        })}
      </ul>
    </div>
  )
}
