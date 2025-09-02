import ReactSelect, { MultiValue, type SingleValue } from "react-select"

import type { FormFieldComponentProps } from "./Form/Form.models"

type Option = {
  value: string
  label: string
}

export type SelectProps = FormFieldComponentProps<string | string[]> & {
  disabled?: boolean
  options: Option[]
  isMulti?: boolean
}

export const Select = ({
  options,
  value,
  onChange,
  onBlur,
  label,
  isMulti,
  error,
  disabled
}: SelectProps) => {
  const isSearchable = options.length > 10

  const selectClassName = isMulti ? "react-multi-select" : "react-select"

  const parsedValue: SingleValue<Option> | MultiValue<Option> = isMulti
    ? options.find(option => (value as string[]).includes(option.value)) || []
    : options.find(option => option.value === value) || null

  const handleChange = (newValue: SingleValue<Option> | MultiValue<Option>) => {
    if (isMulti) {
      onChange((newValue as MultiValue<Option>).map(option => option.value))
      return
    }

    onChange((newValue as SingleValue<Option>)!.value)
  }

  return (
    <div className="w-full max-w-sm">
      {label && <div className="mb-2">{label}</div>}
      <ReactSelect
        menuPortalTarget={document.body}
        isDisabled={disabled}
        blurInputOnSelect={false}
        unstyled
        isMulti={isMulti}
        isSearchable={isSearchable}
        onBlur={onBlur}
        placeholder={null}
        onChange={handleChange}
        value={parsedValue}
        options={options}
        classNamePrefix="react-select"
        className={selectClassName}
        classNames={{
          dropdownIndicator: () => (error ? "!text-error" : ""),
          control: () => (error ? "invalid-input" : "")
        }}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
