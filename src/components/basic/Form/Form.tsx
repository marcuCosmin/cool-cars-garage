import { useState, type ReactNode, type FormEvent, useReducer } from "react"

import { Loader } from "../Loader"
import { Field } from "./Field"

import { createFormAction, fieldsReducer, getFieldsInitialState } from "./utils"

import { mergeClassNames } from "../../../utils/mergeClassNames"
import type { FieldValue } from "../../../utils/validations"

import type { Fields, FormAction, DefaultFields } from "./models"

type FormProps<T extends Record<string, FieldValue>> = {
  containerClassName?: string
  title: ReactNode
  submitLabel: ReactNode
  action: FormAction<T>
  fields: Fields<T>
  children?: ReactNode
}

export const Form = <T extends DefaultFields>({
  title,
  submitLabel,
  containerClassName,
  action,
  fields,
  children
}: FormProps<T>) => {
  const [fieldsState, dispatchFieldsAction] = useReducer(
    fieldsReducer,
    getFieldsInitialState(fields)
  )
  const fieldsValues = Object.entries(fieldsState).reduce(
    (acc, [name, fieldProps]) => {
      const { value } = fieldProps

      acc[name as keyof T] = value as T[keyof T]

      return acc
    },
    {} as T
  )

  const [formError, setFormError] = useState<string | undefined>("")

  const createdAction = createFormAction<T>(action)

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)

    const { fieldsState: newFieldsState, formError } =
      await createdAction(fieldsState)

    dispatchFieldsAction({ type: "SET_FIELDS", fields: newFieldsState })
    setFormError(formError)

    setIsLoading(false)
  }

  const formClassName = mergeClassNames(
    "flex flex-col gap-5 items-center border rounded-md p-5 max-w-md dark:bg-primary w-[95%] shadow-lg",
    containerClassName
  )

  const onFieldErrorChange = (name: string, error?: string) =>
    dispatchFieldsAction({ type: "SET_FIELD_ERROR", name, error })

  const onFieldValueChange = (name: string, value?: FieldValue) =>
    dispatchFieldsAction({ type: "SET_FIELD_VALUE", name, value })

  const onFieldTouchedChange = (name: string) =>
    dispatchFieldsAction({ type: "SET_FIELD_TOUCHED", name })

  const shouldDisplayField = (name: string) => {
    const field = fieldsState[name]

    const { displayCondition } = field

    if (displayCondition) {
      return displayCondition(fieldsValues)
    }

    return true
  }

  return (
    <form className={formClassName} onSubmit={onSubmit}>
      {isLoading && <Loader enableOverlay />}

      <h1>{title}</h1>

      <hr />

      <div className="w-full grid grid-cols-2 flex-col gap-x-5 gap-y-2 items-center max-h-[70vh] overflow-y-auto">
        {Object.entries(fieldsState).map(([name, props]) => {
          const shouldDisplay = shouldDisplayField(name)

          if (!shouldDisplay) {
            return null
          }

          return (
            <Field
              {...props}
              name={name}
              key={name}
              onErrorChange={onFieldErrorChange}
              onTouchedChange={onFieldTouchedChange}
              onValueChange={onFieldValueChange}
            />
          )
        })}
      </div>
      {children}

      <hr />

      {formError && <span className="form-error">{formError}</span>}

      <button type="submit">{submitLabel}</button>
    </form>
  )
}
