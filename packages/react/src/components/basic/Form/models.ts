import type { InputProps } from "../Input"
import type { SelectProps } from "../Select"
import type { Validator } from "../../../utils/validations"
import type { FieldValue } from "../../../models"

type FieldComponentsProps = Partial<
  Omit<InputProps & SelectProps, "value" | "onChange">
>

type FieldProps<T extends DefaultFields> = Omit<
  FieldComponentsProps,
  "defaultValue"
> & {
  defaultValue?: FieldValue
  type: InputProps["type"] | "toggle" | "select" | "date"
  validator?: Validator
  displayCondition?: (fieldsValues: T) => boolean
}

export type DefaultFields = Record<string, FieldValue>

export type Fields<T extends DefaultFields> = {
  [key in keyof T]: FieldProps<T>
}

export type FieldStateProps<T extends DefaultFields> = Omit<
  FieldProps<T>,
  "defaultValue"
> & {
  hidden?: boolean
  value?: FieldValue
  touched: boolean
}

export type FieldsState<T extends DefaultFields> = {
  [key in keyof T]: FieldStateProps<T>
}

export type FormAction<T extends DefaultFields> = (
  fieldsValueMap: T
) => Promise<string | undefined | void> | string | undefined | void

export type FormFieldComponentProps<T> = {
  label?: string
  value: T
  onChange: (value?: T) => void
  error?: string
  onFocus?: () => void
}
