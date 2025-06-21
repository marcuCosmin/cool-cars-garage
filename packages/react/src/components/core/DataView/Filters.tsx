import { Select } from "../../basic/Select"
import { Toggle } from "../../basic/Toggle"

import type { FiltersState, OnFilterChange } from "./model"

type FiltersProps = {
  filters: FiltersState
  onFilterChange: OnFilterChange
}

export const Filters = ({ filters, onFilterChange }: FiltersProps) => {
  return (
    <>
      {Object.entries(filters).map(([label, filterProps]) => {
        const { type } = filterProps

        switch (type) {
          case "select": {
            const { options, value } = filterProps
            const onSelectChange = (value: string | string[] | undefined) =>
              onFilterChange({ label, value: value as string[] })

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
            const onToggleChange = (value?: boolean) =>
              onFilterChange({ label, value: !!value })

            return (
              <Toggle label={label} value={value} onChange={onToggleChange} />
            )
          }
        }
      })}
    </>
  )
}
