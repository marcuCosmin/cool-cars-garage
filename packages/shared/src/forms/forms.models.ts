import { Timestamp } from "firebase-admin/firestore"

export type FormFieldValue = string | number | boolean | Timestamp
export type FormFieldValidator = (value?: FormFieldValue) => string

type FormFields = Record<string, FormFieldValue>

type FormFieldsCommonProps<T extends FormFields> = {
  validate?: FormFieldValidator
  shouldBeIncluded?: (formFields: T) => boolean
}

type FormDateProps<T extends FormFields> = FormFieldsCommonProps<T> & {
  type: "date"
}

type FormToggleProps<T extends FormFields> = FormFieldsCommonProps<T> & {
  type: "toggle"
}

type FormSelectProps<T extends FormFields> = FormFieldsCommonProps<T> & {
  type: "select"
  options: string[]
}

type FormInputProps<T extends FormFields> = FormFieldsCommonProps<T> & {
  type: "text" | "number"
}

export type FormFieldsSchema<T extends FormFields> = {
  [key in keyof T]:
    | FormDateProps<T>
    | FormToggleProps<T>
    | FormSelectProps<T>
    | FormInputProps<T>
}
