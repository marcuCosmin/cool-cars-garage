import { Timestamp } from "firebase-admin/firestore"

import type { DatePickerProps } from "@/components/basic/DatePicker"
import type { InputProps } from "@/components/basic/Input"
import type { SelectProps } from "@/components/basic/Select"
import type { ToggleProps } from "@/components/basic/Toggle"

import type {
  FormDateProps,
  FormData,
  FormInputProps,
  FormSelectProps,
  FormToggleProps
} from "@/globals/forms/forms.models"

export type FieldValue = string | number | boolean | Timestamp

type FormFieldOwnProps<T> = Omit<T, "value" | "onChange" | "error" | "onBlur">

export type ExtendedFormInputProps<T extends FormData> =
  FormFieldOwnProps<InputProps> & FormInputProps<T> & { defaultValue?: string }
export type ExtendedFormSelectProps<T extends FormData> =
  FormFieldOwnProps<SelectProps> &
    Omit<FormSelectProps<T>, "options"> & {
      defaultValue?: string
    }
export type ExtendedFormToggleProps<T extends FormData> =
  FormFieldOwnProps<ToggleProps> &
    FormToggleProps<T> & { defaultValue?: boolean }
export type ExtendedFormDateComponentProps<T extends FormData> =
  FormFieldOwnProps<DatePickerProps> &
    FormDateProps<T> & { defaultValue?: number }

export type ExtendedFormFieldProps<T extends FormData> =
  | ExtendedFormInputProps<T>
  | ExtendedFormSelectProps<T>
  | ExtendedFormToggleProps<T>
  | ExtendedFormDateComponentProps<T>

export type ExtendedFormFieldsSchema<T extends FormData> = {
  [key in keyof T]: ExtendedFormFieldProps<T>
}
