import type { FormFieldComponentProps } from "./Form/models"

export type ToggleProps = FormFieldComponentProps<string> & {
  firstOption: string
  secondOption: string
}

export const Toggle = ({
  firstOption,
  secondOption,
  label,
  value,
  onChange
}: ToggleProps) => {
  const isFirstValue = !value || value === firstOption
  const indicatorPosition = isFirstValue ? "0" : "100%"

  const onToggle = () => {
    let newValue = firstOption

    if (value === firstOption) {
      newValue = secondOption
    }

    onChange(newValue)
  }

  return (
    <div
      className="flex items-center gap-4 cursor-pointer w-full"
      onClick={onToggle}
    >
      <div>{label}</div>

      <div className="flex items-center gap-4 text-xs">
        <div>{firstOption}</div>
        <div className="relative w-8 border-primary dark:border-secondary border rounded-lg h-4">
          <div
            className="absolute non-relative-center h-5 w-5 rounded-full bg-primary dark:bg-secondary transition-[left] duration-300"
            style={{ left: indicatorPosition }}
          />
        </div>
        <div>{secondOption}</div>
      </div>
    </div>
  )
}
