import type { FormData, FormFieldsSchema } from "@/globals/forms/forms.models"

type GetFormDataProps<T extends FormData> = {
  schema: FormFieldsSchema<T>
  data: Partial<T>
}

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

type Errors<T extends FormData> = { [key in keyof T]: string }

export const getFormValidationResult = <T extends FormData>({
  schema,
  data
}: GetFormDataProps<T>) => {
  const errors: Errors<T> = {} as Errors<T>
  const filteredData: T = {} as T

  const schemaKeys = Object.keys(schema) as (keyof T)[]

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

      if (!options.some(option => option === value)) {
        errors[key] = `Invalid option selected for field: ${String(key)}`
      }
    }

    filteredData[key] = value as T[keyof T]
  })

  if (Object.keys(errors).length) {
    return { errors, filteredData: null }
  }

  return { errors: null, filteredData }
}
