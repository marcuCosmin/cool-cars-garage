import { useEffect, useState } from "react"
import { PlusCircleFill, Search } from "react-bootstrap-icons"

import { Input } from "../../basic/Input"
import { DataCard } from "./DataCard"
import { Filters } from "./Filters"

import { dataToArray, filtersConfigToState } from "./utils"
import { parseSearchString } from "../../../utils/string"

import type { FiltersConfig, Data, FiltersState, OnFilterChange } from "./model"

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
  const [filters, setFilters] = useState(filtersConfigToState(filtersConfig))

  const onFilterChange: OnFilterChange = ({ label, value }) => {
    const filter = filters[label]

    setFilters({
      ...filters,
      [label]: { ...filter, value }
    } as FiltersState)
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

    Object.values(filters).forEach(filter => {
      const { type } = filter

      if (type === "toggle") {
        const { filterFn, value } = filter

        if (!value) {
          return
        }

        newData = newData.filter(filterFn)
        return
      }

      const { value, field } = filter

      if (value.length === 0) {
        return
      }

      newData = newData.filter(item => {
        const itemValue = item[field as keyof typeof item]

        return value.some(v => v === itemValue)
      })
    })

    setData(newData)
  }, [initialData, searchQuery, filters])

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="p-5 flex flex-col items-center gap-5 bg-secondary dark:bg-primary min-w-[350px]">
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
          label="Search"
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          endAdornment={<Search width={20} height={20} />}
        />

        <Filters filters={filters} onFilterChange={onFilterChange} />
      </div>

      <ul className="p-5 flex flex-wrap gap-10 overflow-y-auto h-fit max-h-full w-full scrollbar">
        {data.map(({ title, subtitle, id, ...itemProps }) => {
          const onEdit = () => onItemEdit(id)
          const onDelete = () => onItemDelete(id)

          return (
            <DataCard
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
