import { useEffect } from "react"

import { Input, type InputProps } from "@/components/basic/Input"
import { Toggle, type ToggleProps } from "@/components/basic/Toggle"
import { DatePicker } from "@/components/basic/DatePicker"

import type { FormData, FormFieldValue } from "@/globals/forms/forms.models"

import { FormFileField, type FormFileFieldProps } from "./FormFileField"
import { FormSelectField, type FormSelectFieldProps } from "./FormSelectField"

import type { FieldStateProps, FormFieldComponentProps } from "./Form.models"

type FormFieldProps<T extends FormData> = Omit<
  FieldStateProps<T>,
  "isOptional" | "hideCondition"
> & {
  name: string
  onValueChange: (name: string, value?: FormFieldValue) => void
  onTouchedChange: (name: string) => void
  onErrorChange: (name: string, error?: string) => void
  onPendingPromiseChange: (name: string, hasPendingPromise: boolean) => void
  optional?: boolean
}

export const FormField = <T extends FormData>({
  type,
  name,
  touched,
  value,
  onValueChange,
  onErrorChange,
  onTouchedChange,
  onPendingPromiseChange,
  validate,
  optional,
  label,
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
    if (!touched && optional && !value) {
      return
    }

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

  const onPendingChange = (hasPendingPromise: boolean) =>
    onPendingPromiseChange(name, hasPendingPromise)

  const passedProps = {
    ...props,
    label: optional && label ? `${label} (Optional)` : label,
    value,
    onChange,
    onBlur,
    onPendingChange
  }

  useEffect(() => {
    if (!optional || !touched) {
      return
    }

    if (value) {
      handleValidation(value)
      return
    }

    onErrorChange(name)
  }, [optional, touched])

  if (type === "date") {
    return <DatePicker {...(passedProps as FormFieldComponentProps<number>)} />
  }

  if (type === "select") {
    return <FormSelectField {...(passedProps as FormSelectFieldProps)} />
  }

  if (type === "toggle") {
    return <Toggle {...(passedProps as ToggleProps)} />
  }

  if (type === "file") {
    return <FormFileField {...(passedProps as FormFileFieldProps)} />
  }

  return <Input {...(passedProps as InputProps)} type={type} />
}
