import { Select, type SelectProps } from "@/components/basic/Select"
import { Toggle, type ToggleProps } from "@/components/basic/Toggle"

import type { FiltersState, FilterChangeHandler } from "./DataView.model"

import type { RawDataListItem } from "@/shared/dataLists/dataLists.model"

type FiltersProps<RawItem extends RawDataListItem> = {
  filters: FiltersState<RawItem>
  onFilterChange: FilterChangeHandler
}

export const Filters = <RawItem extends RawDataListItem>({
  filters,
  onFilterChange
}: FiltersProps<RawItem>) =>
  filters.map((filterProps, index) => {
    const { type, label } = filterProps

    switch (type) {
      case "select": {
        const { options, value } = filterProps
        const onSelectChange: SelectProps["onChange"] = value =>
          onFilterChange({ value: value as string[], index })

        return (
          <Select
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

        return <Toggle label={label} value={value} onChange={onToggleChange} />
      }
    }
  })
