export type FormFieldValue = string | number | boolean
export type FormFieldValidator = (value?: FormFieldValue) => string

export type FormData = Record<string, FormFieldValue>

type FormFieldsCommonProps<T extends FormData> = {
  validate?: FormFieldValidator
  shouldHide?: (formFields: T) => boolean
}

export type FormDateProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "date"
}

export type FormToggleProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "toggle"
}

export type FormSelectProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "select"
  options: string[]
}

export type FormInputProps<T extends FormData> = FormFieldsCommonProps<T> & {
  type: "text" | "number"
}

export type FormFieldsSchema<T extends FormData> = {
  [key in keyof T]:
    | FormDateProps<T>
    | FormToggleProps<T>
    | FormSelectProps<T>
    | FormInputProps<T>
}
