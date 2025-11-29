import type { FormData } from "@/shared/forms/forms.models"

import type { ExtendedFormFieldsSchema, FieldValue } from "@/models"

import type { FieldsState } from "./Form.models"

const getFormData = <T extends FormData>(fieldsState: FieldsState<T>) => {
  const fieldsValues = Object.entries(fieldsState).reduce(
    (acc, [field, fieldProps]) => {
      acc[field as keyof T] = fieldProps.value as T[keyof T]
      return acc
    },
    {} as T
  )

  const formData = Object.entries(fieldsValues).reduce(
    (acc, [field, value]) => {
      const { shouldHide } = fieldsState[field]
      const isHidden = shouldHide?.(fieldsValues)

      if (!isHidden) {
        acc[field as keyof T] = value as T[keyof T]
      }

      return acc
    },
    {} as T
  )

  return formData
}

export const getFormFieldsValidationResult = <T extends FormData>(
  fieldsState: FieldsState<T>
) => {
  let hasValidationError = false
  const formData = getFormData(fieldsState)
  const validatedFieldsState: FieldsState<T> = { ...fieldsState }

  Object.entries(formData).forEach(([field, value]) => {
    const { validate, isOptional, ...fieldProps } = fieldsState[field]
    const shouldValidate = isOptional?.(formData) ? value : true
    const error = shouldValidate ? validate?.(value) : undefined

    if (error) {
      hasValidationError = true
    }

    validatedFieldsState[field as keyof FieldsState<T>] = {
      ...fieldProps,
      error
    }
  })

  return {
    hasValidationError,
    validatedFieldsState,
    formData
  }
}

export const getFieldsInitialState = <T extends FormData>(
  fields: ExtendedFormFieldsSchema<T>
) =>
  Object.entries(fields).reduce((acc, [name, props]) => {
    const { defaultValue, ...remainingProps } = props
    let value = defaultValue

    if (props.type === "toggle") {
      value = !!defaultValue
    }

    acc[name as keyof FieldsState<T>] = {
      ...remainingProps,
      value,
      error: "",
      touched: false
    }

    return acc
  }, {} as FieldsState<T>)

type FieldsReducerAction<T extends FormData> =
  | { type: "SET_FIELD_VALUE"; name: string; value?: FieldValue }
  | { type: "SET_FIELD_ERROR"; name: string; error?: string }
  | { type: "SET_FIELD_TOUCHED"; name: string }
  | { type: "SET_FIELDS"; fields: FieldsState<T> }

export const fieldsReducer = <T extends FormData>(
  state: FieldsState<T>,
  action: FieldsReducerAction<T>
) => {
  switch (action.type) {
    case "SET_FIELD_VALUE":
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          value: action.value
        }
      }
    case "SET_FIELD_ERROR":
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          error: action.error
        }
      }
    case "SET_FIELD_TOUCHED":
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          touched: true
        }
      }
    case "SET_FIELDS":
      return action.fields
    default:
      return state
  }
}
