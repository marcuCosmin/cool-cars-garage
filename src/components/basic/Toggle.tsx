import { useState } from "react"

import { Input } from "./Input"

type ToggleOption = {
  label: string
  value: string
}

export type ToggleProps = {
  name: string
  firstOption: ToggleOption
  secondOption: ToggleOption
  label: string
}

export const Toggle = ({
  name,
  firstOption,
  secondOption,
  label
}: ToggleProps) => {
  const [innerValue, setInnerValue] = useState(firstOption.value)
  const isFirstValue = innerValue === firstOption.value
  const indicatorPosition = isFirstValue ? "0" : "100%"

  const onToggle = () => {
    let newValue = firstOption.value

    if (innerValue === firstOption.value) {
      newValue = secondOption.value
    }

    setInnerValue(newValue)
  }

  return (
    <div
      className="flex items-center gap-4 cursor-pointer w-full"
      onClick={onToggle}
    >
      <div>{label}</div>

      <div className="flex items-center gap-4 text-xs">
        <div>{firstOption.label}</div>
        <div className="relative w-8 border-primary dark:border-secondary border rounded-lg h-4">
          <div
            className="absolute non-relative-center h-5 w-5 rounded-full bg-primary dark:bg-secondary transition-[left] duration-300"
            style={{ left: indicatorPosition }}
          />
        </div>
        <div>{secondOption.label}</div>
      </div>

      <Input
        name={name}
        value={firstOption.value}
        className="hidden"
        type="radio"
        checked={isFirstValue}
      />
      <Input
        name={name}
        value={secondOption.value}
        className="hidden"
        type="radio"
        checked={!isFirstValue}
      />
    </div>
  )
}
