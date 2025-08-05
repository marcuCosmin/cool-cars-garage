import type { FieldValue } from "@/models"

import type { FieldsState, DefaultFields, Fields } from "./Form.models"

export const getFormFieldsValidationResult = <T extends DefaultFields>(
  fieldsState: FieldsState<T>
) => {
  let hasValidationError = false
  const validatedFieldsState: FieldsState<T> = { ...fieldsState }
  const fieldsMap: T = {} as T

  Object.entries(validatedFieldsState).forEach(([field, fieldProps]) => {
    const { value, validator } = fieldProps
    const error = validator?.(value)

    validatedFieldsState[field as keyof FieldsState<T>] = {
      ...fieldProps,
      error,
      touched: true
    }

    if (error) {
      hasValidationError = true
      return
    }

    fieldsMap[field as keyof T] = value as T[keyof T]
  })

  return {
    hasValidationError,
    validatedFieldsState,
    fieldsMap
  }
}

export const getFieldsInitialState = <T extends DefaultFields>(
  fields: Fields<T>
) =>
  Object.entries(fields).reduce((acc, [name, props]) => {
    const { defaultValue, ...remainingProps } = props

    acc[name as keyof FieldsState<T>] = {
      ...remainingProps,
      value: defaultValue,
      error: "",
      touched: false
    }

    return acc
  }, {} as FieldsState<T>)

type FieldsReducerAction<T extends DefaultFields> =
  | { type: "SET_FIELD_VALUE"; name: string; value?: FieldValue }
  | { type: "SET_FIELD_ERROR"; name: string; error?: string }
  | { type: "SET_FIELD_TOUCHED"; name: string }
  | { type: "SET_FIELDS"; fields: FieldsState<T> }

export const fieldsReducer = <T extends DefaultFields>(
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
