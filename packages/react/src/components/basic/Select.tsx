import ReactSelect, { MultiValue, type SingleValue } from "react-select"

import type { FormFieldComponentProps } from "./Form/Form.models"

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
  onBlur,
  label,
  isMulti,
  error
}: SelectProps) => {
  const isSearchable = options.length > 10

  const parsedOptions = options.map(option => ({
    value: option,
    label: option
  }))

  const selectClassName = isMulti ? "react-multi-select" : "react-select"

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
    <div className="w-full max-w-sm">
      {label && <div className="mb-2">{label}</div>}
      <ReactSelect
        blurInputOnSelect={false}
        unstyled
        isMulti={isMulti}
        isSearchable={isSearchable}
        onBlur={onBlur}
        placeholder={null}
        onChange={handleChange}
        value={parsedValue}
        options={parsedOptions}
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
