import type { FormData, FormFieldsSchema } from "@/globals/forms/forms.models"
import type { DistributiveOmit } from "@/globals/model"

import type {
  ExtendedFormDateComponentProps,
  ExtendedFormFieldsSchema,
  ExtendedFormFileProps,
  ExtendedFormInputProps,
  ExtendedFormSelectProps,
  ExtendedFormToggleProps
} from "@/models"

type FormInputAdditionalProps<T extends FormData> = DistributiveOmit<
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
type FormSelectAdditionalProps<T extends FormData, K extends keyof T> = Omit<
  ExtendedFormSelectProps<T>,
  "options" | "type"
> & {
  options: Record<T[K] & string, { label: string }>
}
type FormFileAdditionalProps<T extends FormData> = Omit<
  ExtendedFormFileProps<T>,
  "type"
>

export type AdditionalFieldsProps<T extends FormData> = {
  [key in keyof T]:
    | FormInputAdditionalProps<T>
    | FormSelectAdditionalProps<T, key>
    | FormToggleAdditionalProps<T>
    | FormDateAdditionalProps<T>
    | FormFileAdditionalProps<T>
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
      const castExtendedField = extendedField as FormSelectAdditionalProps<
        T,
        keyof T
      >

      const extendedSelectOptions = options.map(value => {
        const { label } = castExtendedField.options[value]

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
      | ExtendedFormFileProps<T>

    return acc
  }, {} as ExtendedFormFieldsSchema<T>)

  return extendedFields
}
