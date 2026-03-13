import { useState } from "react"
import { Funnel } from "react-bootstrap-icons"

import { Select, type SelectProps } from "@/components/basic/Select"
import { Toggle, type ToggleProps } from "@/components/basic/Toggle"
import { DatePicker, type DatePickerProps } from "@/components/basic/DatePicker"
import { Tooltip } from "@/components/basic/Tooltip"

import type {
  FiltersState,
  FilterChangeHandler,
  FilterItem
} from "./DataView.model"

type DataViewFiltersProps<
  Filter extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
> = {
  filters: FiltersState<Filter, ServerSideFetching>
  onFilterChange: FilterChangeHandler
}

export const DataViewFilters = <
  Filter extends FilterItem<ServerSideFetching>,
  ServerSideFetching extends boolean
>({
  filters,
  onFilterChange
}: DataViewFiltersProps<Filter, ServerSideFetching>) => {
  const [isOpen, setIsOpen] = useState(false)

  const onFilterButtonClick = () => setIsOpen(!isOpen)

  return (
    <div className="w-full overflow-hidden">
      <Tooltip
        label="Filters"
        containerTag="button"
        containerProps={{
          type: "button",
          onClick: onFilterButtonClick,
          className: "sm:hidden"
        }}
      >
        <Funnel size={20} />
      </Tooltip>

      <div
        className={`mt-5 max-h-[50vh] px-3 flex-wrap gap-5 justify-center sm:justify-start items-end overflow-y-auto ${isOpen ? "flex" : "hidden sm:flex"}`}
      >
        {filters.map((filterProps, index) => {
          const { type, label } = filterProps

          switch (type) {
            case "select": {
              const { options, value } = filterProps
              const onSelectChange: SelectProps["onChange"] = value =>
                onFilterChange({ value: value as string[], index })

              return (
                <Select
                  key={index}
                  label={label}
                  isMulti
                  onChange={onSelectChange}
                  options={options}
                  value={value}
                />
              )
            }

            case "toggle": {
              const { value } = filterProps
              const onToggleChange: ToggleProps["onChange"] = value =>
                onFilterChange({ value: !!value, index })

              return (
                <Toggle
                  key={index}
                  label={label}
                  value={value}
                  onChange={onToggleChange}
                />
              )
            }

            case "date": {
              const { value, includeEndOfDay } = filterProps
              const onDateChange: DatePickerProps["onChange"] = value =>
                onFilterChange({ value, index })

              return (
                <DatePicker
                  key={index}
                  label={label}
                  value={value}
                  onChange={onDateChange}
                  includeEndOfDay={includeEndOfDay}
                />
              )
            }
          }
        })}
      </div>
    </div>
  )
}
