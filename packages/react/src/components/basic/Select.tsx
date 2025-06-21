import ReactSelect, { MultiValue, type SingleValue } from "react-select"

import type { FormFieldComponentProps } from "./Form/models"

type Option = {
  value: string
  label: string
}

export type SelectProps = FormFieldComponentProps<string | string[]> & {
  options: string[]
  isMulti?: boolean
}

export const Select = ({
  options,
  value,
  onChange,
  onFocus,
  label,
  isMulti,
  error
}: SelectProps) => {
  const isSearchable = options.length > 10

  const parsedOptions = options.map(option => ({
    value: option,
    label: option
  }))

  const parsedValue: SingleValue<Option> | MultiValue<Option> = isMulti
    ? (value as string[]).map(option => ({ value: option, label: option }))
    : { value: value as string, label: value as string }

  const handleChange = (newValue: SingleValue<Option> | MultiValue<Option>) => {
    if (isMulti) {
      onChange((newValue as MultiValue<Option>).map(option => option.value))
      return
    }

    onChange((newValue as SingleValue<Option>)!.value)
  }

  return (
    <div className="w-full">
      {label && <div className="mb-2">{label}</div>}
      <ReactSelect
        isMulti={isMulti}
        isSearchable={isSearchable}
        onFocus={onFocus}
        placeholder={null}
        onChange={handleChange}
        value={parsedValue}
        options={parsedOptions}
        classNamePrefix="react-select"
        className={isMulti ? "react-multi-select" : "react-select"}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
