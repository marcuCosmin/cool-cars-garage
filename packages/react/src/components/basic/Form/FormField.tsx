import { Timestamp } from "firebase/firestore"

import { Input, type InputProps } from "../Input"
import { Toggle, type ToggleProps } from "../Toggle"
import { Select, type SelectProps } from "../Select"
import { DatePicker } from "../DatePicker"

import type {
  DefaultFields,
  FieldStateProps,
  FormFieldComponentProps
} from "./Form.models"
import type { FieldValue } from "../../../models"

type FormFieldProps<T extends DefaultFields> = Omit<
  FieldStateProps<T>,
  "hideCondition"
> & {
  name: string
  onValueChange: (name: string, value?: FieldValue) => void
  onTouchedChange: (name: string) => void
  onErrorChange: (name: string, error?: string) => void
}

export const FormField = <T extends DefaultFields>({
  type,
  name,
  touched,
  value,
  onValueChange,
  onErrorChange,
  onTouchedChange,
  validator,
  ...props
}: FormFieldProps<T>) => {
  const validate = (value?: FieldValue) => {
    if (!validator) {
      return
    }

    const errorMessage = validator(value)
    onErrorChange(name, errorMessage)
  }

  const onBlur = () => {
    onTouchedChange(name)
    validate(value)
  }

  const onChange = (value?: FieldValue) => {
    onValueChange(name, value)

    if (!touched) {
      return
    }

    validate(value)
  }

  const passedProps = {
    ...props,
    value,
    onChange,
    onBlur
  }

  if (type === "date") {
    return (
      <DatePicker {...(passedProps as FormFieldComponentProps<Timestamp>)} />
    )
  }

  if (type === "select") {
    return <Select {...(passedProps as SelectProps)} />
  }

  if (type === "toggle") {
    return <Toggle {...(passedProps as ToggleProps)} />
  }

  return <Input {...(passedProps as InputProps)} type={type} />
}
