import { Input, type InputProps } from "../Input"
import { Toggle, type ToggleProps } from "../Toggle"
import { Select, type SelectProps } from "../Select"
import { DatePicker } from "../DatePicker"

import type {
  DefaultFields,
  FieldStateProps,
  FormFieldComponentProps
} from "./models"
import type { FieldValue } from "../../../utils/validations"

type FieldProps<T extends DefaultFields> = Omit<
  FieldStateProps<T>,
  "hideCondition"
> & {
  name: string
  onValueChange: (name: string, value?: FieldValue) => void
  onTouchedChange: (name: string) => void
  onErrorChange: (name: string, error?: string) => void
}

export const Field = <T extends DefaultFields>({
  type,
  name,
  onValueChange,
  onErrorChange,
  onTouchedChange,
  touched,
  validator,
  ...props
}: FieldProps<T>) => {
  const validate = (value?: FieldValue) => {
    if (!touched || !validator) {
      return
    }

    const errorMessage = validator(value)
    onErrorChange(name, errorMessage)
  }

  const onFocus = () => onTouchedChange(name)
  const onChange = (value?: FieldValue) => {
    onValueChange(name, value)
    validate(value)
  }

  const passedProps = {
    ...props,
    onChange,
    onFocus
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

  return <Input {...(passedProps as InputProps)} />
}
