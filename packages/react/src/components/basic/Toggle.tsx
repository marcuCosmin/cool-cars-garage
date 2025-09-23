import type { FormFieldComponentProps } from "./Form/Form.models"

export type ToggleProps = FormFieldComponentProps<boolean>

export const Toggle = ({ label, value, onChange }: ToggleProps) => {
  const onToggle = () => {
    onChange(!value)
  }

  return (
    <div className="flex items-center gap-4 cursor-pointer" onClick={onToggle}>
      <div>{label}</div>

      <button
        type="button"
        className={`flex w-12 p-0.5 border-primary border rounded-xl ${value ? "bg-primary justify-end" : "bg-white dark:bg-black justify-start"}`}
      >
        <div
          className={`h-5 w-5 rounded-full transition-[all] duration-300 ${value ? "bg-white dark:bg-black" : "bg-primary"}`}
        />
      </button>
    </div>
  )
}
