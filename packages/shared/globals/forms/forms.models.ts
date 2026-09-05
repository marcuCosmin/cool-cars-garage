import type { SearchPayloads } from "../requests/requests.model"

export type FormFieldValue = string | number | boolean

export type FormData = Record<string, FormFieldValue>

type FormFieldValidatorProps<T extends FormData> = {
  value?: FormFieldValue
  formData: Partial<T>
}

export type FormFieldValidator<T extends FormData = FormData> = ({
  value,
  formData
}: FormFieldValidatorProps<T>) => string

type FormFieldsCommonProps<T extends FormData> = {
  validate?: FormFieldValidator<T>
  shouldHide?: (formFields: Partial<T>) => boolean
  isOptional?: (data: Partial<T>) => boolean
}

export type FormDateProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "date"
}

export type FormToggleProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "toggle"
}

export type FormSelectProps<
  T extends FormData,
  K extends keyof T
> = FormFieldsCommonProps<T> & {
  type: "select"
  options: (T[K] & string)[] | SearchPayloads
}

export type FormInputProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "text" | "number" | "password" | "textarea"
}

export type FormFileProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "file"
}

export type FormFieldsSchema<T extends FormData> = {
  [key in keyof Required<T>]:
    | FormDateProps<T>
    | FormToggleProps<T>
    | FormSelectProps<T, key>
    | FormInputProps<T>
    | FormFileProps<T>
}

export type ChecksBulkExportData = {
  startTimestamp: number
  endTimestamp: number
}
