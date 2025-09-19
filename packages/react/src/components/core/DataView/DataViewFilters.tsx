import { Select, type SelectProps } from "@/components/basic/Select"
import { Toggle, type ToggleProps } from "@/components/basic/Toggle"
import { DatePicker, type DatePickerProps } from "@/components/basic/DatePicker"

import type { FiltersState, FilterChangeHandler } from "./DataView.model"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

type DataViewFiltersProps<RawItem extends RawDataListItem> = {
  filters: FiltersState<RawItem>
  onFilterChange: FilterChangeHandler
}

export const DataViewFilters = <RawItem extends RawDataListItem>({
  filters,
  onFilterChange
}: DataViewFiltersProps<RawItem>) =>
  filters.map((filterProps, index) => {
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
  })
