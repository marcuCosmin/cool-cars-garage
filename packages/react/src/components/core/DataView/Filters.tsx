import { Select, type SelectProps } from "@/components/basic/Select"
import { Toggle, type ToggleProps } from "@/components/basic/Toggle"

import type {
  DefaultDataItem,
  FiltersState,
  FilterChangeHandler
} from "./DataView.model"

type FiltersProps<DataItem extends DefaultDataItem> = {
  filters: FiltersState<DataItem>
  onFilterChange: FilterChangeHandler
}

export const Filters = <DataItem extends DefaultDataItem>({
  filters,
  onFilterChange
}: FiltersProps<DataItem>) =>
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
