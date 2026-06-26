import type {
  DocWithID,
  FirestoreCollectionsMap,
  FirestoreCollectionsNames
} from "@/globals/firestore/firestore.model"
import type {
  FormData,
  FormFieldsSchema,
  FormSelectProps
} from "@/globals/forms/forms.models"
import type { DistributiveOmit } from "@/globals/model"
import type { SearchPayloads } from "@/globals/requests/requests.model"

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

type FormSelectDynamicOptionsAdditionalProps<
  Collection extends FirestoreCollectionsNames
> = {
  getValue: (doc: DocWithID<FirestoreCollectionsMap[Collection]>) => string
  getLabel: (doc: DocWithID<FirestoreCollectionsMap[Collection]>) => string
}
type FormSelectStaticOptionsAdditionalProps<
  Data extends FormData,
  Key extends keyof Data
> = Record<Data[Key] & string, { label: string }>
export type FormSelectDynamicOptions<
  Collection extends FirestoreCollectionsNames,
  Extended extends boolean
> = Extended extends true
  ? FormSelectDynamicOptionsAdditionalProps<Collection> & SearchPayloads
  : FormSelectDynamicOptionsAdditionalProps<Collection>
type FormSelectStaticOptions<
  Data extends FormData,
  Key extends keyof Data,
  Extended extends boolean
> = Extended extends true
  ? { label: string; value: Data[Key] }
  : FormSelectStaticOptionsAdditionalProps<Data, Key>
type FormSelectOptions<
  Data extends FormData,
  Key extends keyof Data,
  Schema extends FormFieldsSchema<Data>,
  Extended extends boolean
> =
  Schema[Key] extends FormSelectProps<Data, Key>
    ? Schema[Key]["options"] extends {
        collectionId: infer Collection extends FirestoreCollectionsNames
      }
      ? FormSelectDynamicOptions<Collection, Extended>
      : FormSelectStaticOptions<Data, Key, false>
    : never

type FormSelectAdditionalProps<
  Data extends FormData,
  Key extends keyof Data,
  Schema extends FormFieldsSchema<Data>
> = Omit<ExtendedFormSelectProps<Data>, "options" | "type"> & {
  options: FormSelectOptions<Data, Key, Schema, false>
}
type FormFileAdditionalProps<T extends FormData> = Omit<
  ExtendedFormFileProps<T>,
  "type"
>

export type AdditionalFieldsProps<
  T extends FormData,
  Schema extends FormFieldsSchema<T>
> = {
  [key in keyof T]:
    | FormInputAdditionalProps<T>
    | FormSelectAdditionalProps<T, key, Schema>
    | FormToggleAdditionalProps<T>
    | FormDateAdditionalProps<T>
    | FormFileAdditionalProps<T>
}

type ExtendFormFieldsProps<T extends FormData> = {
  fieldsSchema: FormFieldsSchema<T>
  additionalFieldsProps: AdditionalFieldsProps<T, FormFieldsSchema<T>>
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
        keyof T,
        FormFieldsSchema<T>
      >

      const extendedSelectOptions = Array.isArray(options)
        ? options.map(value => {
            const { label } = (
              castExtendedField.options as FormSelectStaticOptionsAdditionalProps<
                T,
                keyof T
              >
            )[value]

            return {
              value,
              label
            }
          })
        : { ...options, ...castExtendedField.options }

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
