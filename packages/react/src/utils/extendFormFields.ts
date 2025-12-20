import type { FormData, FormFieldsSchema } from "@/shared/forms/forms.models"

import type {
  ExtendedFormDateComponentProps,
  ExtendedFormFieldsSchema,
  ExtendedFormInputProps,
  ExtendedFormSelectProps,
  ExtendedFormToggleProps
} from "@/models"

type FormInputAdditionalProps<T extends FormData> = Omit<
  ExtendedFormInputProps<T>,
  "type"
>

type FormToggleAdditionalProps<T extends FormData> = Omit<
  ExtendedFormToggleProps<T>,
  "type"
>
type FormDateAdditionalProps<T extends FormData> = Omit<
  ExtendedFormDateComponentProps<T>,
  "type"
>
type FormSelectAdditionalProps<T extends FormData> = Omit<
  ExtendedFormSelectProps<T>,
  "options" | "type"
> & {
  options: string[]
}

export type AdditionalFieldsProps<T extends FormData> = {
  [key in keyof T]:
    | FormInputAdditionalProps<T>
    | FormSelectAdditionalProps<T>
    | FormToggleAdditionalProps<T>
    | FormDateAdditionalProps<T>
}

type ExtendFormFieldsProps<T extends FormData> = {
  fieldsSchema: FormFieldsSchema<T>
  additionalFieldsProps: AdditionalFieldsProps<T>
}

export const extendFormFields = <T extends FormData>({
  fieldsSchema,
  additionalFieldsProps
}: ExtendFormFieldsProps<T>): ExtendedFormFieldsSchema<T> => {
  const extendedFields = Object.keys(fieldsSchema).reduce((acc, key) => {
    const field = fieldsSchema[key]
    const extendedField = additionalFieldsProps[key]

    if (field.type === "select") {
      const { options, ...otherFieldProps } = field

      const extendedSelectOptions = options.map((value, index) => {
        const label = (extendedField as FormSelectAdditionalProps<T>).options[
          index
        ]

        return {
          value,
          label
        }
      })

      acc[key as keyof T] = {
        ...otherFieldProps,
        ...extendedField,
        options: extendedSelectOptions
      } as ExtendedFormSelectProps<T>

      return acc
    }

    acc[key as keyof T] = {
      ...field,
      ...extendedField
    } as
      | ExtendedFormInputProps<T>
      | ExtendedFormToggleProps<T>
      | ExtendedFormDateComponentProps<T>

    return acc
  }, {} as ExtendedFormFieldsSchema<T>)

  return extendedFields
}
