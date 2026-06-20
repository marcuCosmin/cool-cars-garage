import type { DatePickerProps } from "@/components/basic/DatePicker"
import type { FileInputProps } from "@/components/basic/FileInput"
import type { InputBaseProps } from "@/components/basic/Input"
import type { SelectProps } from "@/components/basic/Select"
import type { ToggleProps } from "@/components/basic/Toggle"

import type {
  FormDateProps,
  FormData,
  FormFileProps,
  FormInputProps,
  FormSelectProps,
  FormToggleProps
} from "@/globals/forms/forms.models"
import type { FileEntityType } from "@/globals/requests/requests.model"

type FormFieldOwnProps<T> = Omit<T, "value" | "onChange" | "error" | "onBlur">

type ExtendedFormInputCommonProps<T extends FormData> =
  FormFieldOwnProps<InputBaseProps> &
    Omit<FormInputProps<T>, "type"> & {
      defaultValue?: string
    }

export type ExtendedFormInputProps<T extends FormData> =
  | (ExtendedFormInputCommonProps<T> & {
      type: "text" | "number" | "password"
    })
  | (ExtendedFormInputCommonProps<T> & {
      type: "textarea"
      rows?: number
    })
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

export type ExtendedFormFileProps<T extends FormData> =
  FormFieldOwnProps<FileInputProps> &
    FormFileProps<T> & {
      uploadType: FileEntityType
      resourceId: string
      defaultValue?: string
    }

export type ExtendedFormFieldProps<T extends FormData> =
  | ExtendedFormInputProps<T>
  | ExtendedFormSelectProps<T>
  | ExtendedFormToggleProps<T>
  | ExtendedFormDateComponentProps<T>
  | ExtendedFormFileProps<T>

export type ExtendedFormFieldsSchema<T extends FormData> = {
  [key in keyof T]: ExtendedFormFieldProps<T>
}
