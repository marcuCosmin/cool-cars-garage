import { getFirestoreDocs } from "@/backend/firebase/utils"

import type { FormData, FormFieldsSchema } from "@/globals/forms/forms.models"
import type {
  DocWithID,
  FirestoreCollectionsMap,
  FirestoreCollectionsNames
} from "@/globals/firestore/firestore.model"

const formDataTypes = {
  text: "string",
  textarea: "string",
  file: "string",
  password: "string",
  number: "string",
  date: "number",
  toggle: "boolean",
  select: "string"
}

type FieldArtifact<FieldConfig> = FieldConfig extends {
  type: "select"
  options: { collectionId: infer Collection extends FirestoreCollectionsNames }
}
  ? DocWithID<FirestoreCollectionsMap[Collection]>
  : never

type FormValidationArtifacts<
  Data extends FormData,
  Schema extends FormFieldsSchema<Data>
> = {
  [Key in keyof Schema]: FieldArtifact<Schema[Key]>
}

type Errors<Data extends FormData> = { [key in keyof Data]: string }

type GetFormDataProps<
  Data extends FormData,
  Schema extends FormFieldsSchema<Data>
> = {
  schema: Schema
  data: Partial<Data>
}

export const getFormValidationResult = async <
  Data extends FormData,
  Schema extends FormFieldsSchema<Data>
>({
  schema,
  data
}: GetFormDataProps<Data, Schema>) => {
  const errors: Errors<Data> = {} as Errors<Data>
  const filteredData: Data = {} as Data
  const artifacts = {} as FormValidationArtifacts<Data, Schema>

  const schemaKeys = Object.keys(schema) as (keyof Data)[]

  const dynamicValidations: Promise<void>[] = []

  schemaKeys.forEach(key => {
    const fieldSchema = schema[key]
    const { type, validate, shouldHide, isOptional } = fieldSchema
    const value = data[key]

    const isHidden = shouldHide?.(data)

    if (isHidden) {
      return
    }

    if (isOptional?.(data) === true && !value) {
      return
    }

    const dataType = formDataTypes[type]

    if (typeof value !== dataType) {
      errors[key] = `Invalid data for field: ${String(key)}`
      return
    }

    if (validate) {
      const error = validate(value)

      if (error) {
        errors[key] = error
        return
      }
    }

    if (fieldSchema.type === "select") {
      const { options } = fieldSchema

      if (Array.isArray(options)) {
        if (!options.some(option => option === value)) {
          errors[key] = `Invalid option selected for field: ${String(key)}`
          return
        }
      } else {
        const promise = getFirestoreDocs({
          collection: options.collectionId,
          queries: [...(options.filters ?? []), ["__name__", "==", value]]
        }).then(([doc]) => {
          if (!doc) {
            errors[key] = `Invalid option selected for field: ${String(key)}`
            return
          }

          artifacts[key] = doc as FieldArtifact<Schema[keyof Data]>
        })

        dynamicValidations.push(promise)
      }
    }

    filteredData[key] = value as Data[keyof Data]
  })

  await Promise.all(dynamicValidations)

  if (Object.keys(errors).length) {
    return { errors, filteredData: null, artifacts: null }
  }

  return {
    errors: null,
    filteredData,
    artifacts
  }
}
