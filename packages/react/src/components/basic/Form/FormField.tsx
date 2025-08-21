import { Input, type InputProps } from "@/components/basic/Input"
import { Toggle, type ToggleProps } from "@/components/basic/Toggle"
import { Select, type SelectProps } from "@/components/basic/Select"
import { DatePicker } from "@/components/basic/DatePicker"

import type { FormData, FormFieldValue } from "@/shared/forms/forms.models"

import type { FieldStateProps, FormFieldComponentProps } from "./Form.models"

type FormFieldProps<T extends FormData> = Omit<
  FieldStateProps<T>,
  "hideCondition"
> & {
  name: string
  onValueChange: (name: string, value?: FormFieldValue) => void
  onTouchedChange: (name: string) => void
  onErrorChange: (name: string, error?: string) => void
}

export const FormField = <T extends FormData>({
  type,
  name,
  touched,
  value,
  onValueChange,
  onErrorChange,
  onTouchedChange,
  validate,
  ...props
}: FormFieldProps<T>) => {
  const handleValidation = (value?: FormFieldValue) => {
    if (!validate) {
      return
    }

    const errorMessage = validate(value)
    onErrorChange(name, errorMessage)
  }

  const onBlur = () => {
    onTouchedChange(name)
    handleValidation(value)
  }

  const onChange = (value?: FormFieldValue) => {
    onValueChange(name, value)

    if (!touched) {
      return
    }

    handleValidation(value)
  }

  const passedProps = {
    ...props,
    value,
    onChange,
    onBlur
  }

  if (type === "date") {
    return <DatePicker {...(passedProps as FormFieldComponentProps<number>)} />
  }

  if (type === "select") {
    return <Select {...(passedProps as SelectProps)} />
  }

  if (type === "toggle") {
    return <Toggle {...(passedProps as ToggleProps)} />
  }

  return <Input {...(passedProps as InputProps)} type={type} />
}
