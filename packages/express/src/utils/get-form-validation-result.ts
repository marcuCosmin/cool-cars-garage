import type { FormData, FormFieldsSchema } from "@/shared/forms/forms.models"

type GetFormDataProps<T extends FormData> = {
  schema: FormFieldsSchema<T>
  data: Partial<T>
}

const formDataTypes = {
  text: "string",
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

  Object.entries(schema).forEach(([key, fieldSchema]) => {
    const castedKey = key as keyof T
    const { type, validate, shouldHide, isOptional } = fieldSchema
    const value = data[castedKey]

    const isHidden = shouldHide?.(data)

    if (isHidden) {
      return
    }

    if (isOptional?.(data) === false && !value) {
      return
    }

    const dataType = formDataTypes[type]

    if (typeof value !== dataType) {
      errors[castedKey] = `Invalid data for field: ${String(castedKey)}`
      return
    }

    if (validate) {
      const error = validate(value)

      if (error) {
        errors[castedKey] = error
        return
      }
    }

    if (type === "select") {
      const { options } = fieldSchema

      if (!options.includes(value as string)) {
        errors[castedKey] =
          `Invalid option selected for field: ${String(castedKey)}`
      }
    }

    filteredData[castedKey] = value as T[keyof T]
  })

  if (Object.keys(errors).length) {
    return { errors, filteredData: null }
  }

  return { errors: null, filteredData }
}
