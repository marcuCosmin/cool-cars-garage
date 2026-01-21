import type { FormData, FormFieldValue } from "@/globals/forms/forms.models"
import type { ExtendedFormFieldProps } from "@/models"

export type FieldStateProps<T extends FormData> = Omit<
  ExtendedFormFieldProps<T>,
  "defaultValue"
> & {
  error?: string
  value?: FormFieldValue
  touched: boolean
}

export type FieldsState<T extends FormData> = {
  [key in keyof T]: FieldStateProps<T>
}

export type FormAction<T extends FormData> = (
  fieldsValueMap: T
) => Promise<unknown>

export type FormFieldComponentProps<T> = {
  label?: string
  value: T
  onChange: (value?: T) => void
  error?: string
  onBlur?: () => void
}
