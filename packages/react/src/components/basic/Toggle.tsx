import type { FormFieldComponentProps } from "./Form/models"

export type ToggleProps = FormFieldComponentProps<boolean>

export const Toggle = ({ label, value, onChange }: ToggleProps) => {
  const indicatorPosition = value ? "100%" : "0"

  const onToggle = () => {
    onChange(!value)
  }

  return (
    <div
      className="flex items-center gap-4 cursor-pointer w-full"
      onClick={onToggle}
    >
      <div>{label}</div>

      <div className="flex items-center gap-4 text-xs">
        <div className="relative w-8 border-primary dark:border-secondary border rounded-lg h-4">
          <div
            className={`absolute non-relative-center h-5 w-5 rounded-full bg-primary dark:bg-secondary transition-[all] duration-300 ${value ? "brightness-100" : "brightness-50"}`}
            style={{ left: indicatorPosition }}
          />
        </div>
      </div>
    </div>
  )
}
