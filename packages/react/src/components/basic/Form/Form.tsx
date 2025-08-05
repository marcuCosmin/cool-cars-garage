import { useReducer, type ReactNode, type FormEvent } from "react"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"

import { mergeClassNames } from "@/utils/mergeClassNames"

import type { FieldValue } from "@/models"

import { FormField } from "./FormField"

import {
  fieldsReducer,
  getFieldsInitialState,
  getFormFieldsValidationResult
} from "./Form.utils"

import type { Fields, FormAction, DefaultFields } from "./Form.models"

type FormProps<T extends DefaultFields> = {
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

  const {
    error: formError,
    isLoading,
    mutate: mutateAction
  } = useAppMutation({
    mutationFn: action,
    showToast: false
  })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { fieldsMap, hasValidationError, validatedFieldsState } =
      getFormFieldsValidationResult(fieldsState)
    dispatchFieldsAction({ type: "SET_FIELDS", fields: validatedFieldsState })

    if (hasValidationError) {
      return
    }

    await mutateAction(fieldsMap)
  }

  const formClassName = mergeClassNames(
    "flex flex-col gap-5 items-center border border-primary rounded-sm p-5 bg-white dark:bg-black sm:min-w-sm w-full",
    containerClassName
  )

  const onFieldErrorChange = (name: string, error?: string) =>
    dispatchFieldsAction({ type: "SET_FIELD_ERROR", name, error })

  const onFieldValueChange = (name: string, value?: FieldValue) =>
    dispatchFieldsAction({ type: "SET_FIELD_VALUE", name, value })

  const onFieldTouchedChange = (name: string) =>
    dispatchFieldsAction({ type: "SET_FIELD_TOUCHED", name })

  return (
    <form className={formClassName} onSubmit={onSubmit}>
      {isLoading && <Loader enableOverlay />}

      <h1>{title}</h1>

      <hr />

      <div className="w-full p-2 flex flex-col gap-x-5 gap-y-2 items-center">
        {Object.entries(fieldsState).map(([name, props]) => {
          const { displayCondition, ...remainingProps } = props
          const shouldDisplay = displayCondition
            ? displayCondition(fieldsValues)
            : true

          if (!shouldDisplay) {
            return null
          }

          return (
            <FormField
              {...remainingProps}
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
