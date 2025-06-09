import { Toggle } from "../../basic/Toggle"

import type { FiltersState } from "./model"

type FiltersProps = {
  filters: FiltersState
  onFilterToggle: (label: string) => void
}

export const Filters = ({ filters, onFilterToggle }: FiltersProps) => {
  return (
    <ul>
      {Object.entries(filters).map(([label, { active }]) => {
        const onChange = () => onFilterToggle(label)

        return (
          <li>
            <Toggle label={label} value={active} onChange={onChange} />
          </li>
        )
      })}
    </ul>
  )
}
