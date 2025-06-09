import ReactSelect, { MultiValue, type SingleValue } from "react-select"

import type { FormFieldComponentProps } from "./Form/models"

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

  const handleChange = (option: SingleValue<string> | MultiValue<string>) => {
    if (!option) {
      onChange(isMulti ? [] : "")
      return
    }

    onChange(option as string | string[])
  }

  return (
    <div>
      {label && <div className="mb-2">{label}</div>}
      <ReactSelect
        isMulti={isMulti}
        isSearchable={isSearchable}
        onFocus={onFocus}
        placeholder={null}
        onChange={handleChange}
        value={value}
        options={options}
        classNamePrefix="react-select"
        className="react-select"
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
