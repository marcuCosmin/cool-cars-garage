import { useReducer, type ReactNode, type FormEvent } from "react"

import { useAppMutation } from "@/hooks/useAppMutation"

import { Loader } from "@/components/basic/Loader"

import { mergeClassNames } from "@/utils/mergeClassNames"

import type { FormData } from "@/shared/forms/forms.models"

import type { ExtendedFormFieldsSchema, FieldValue } from "@/models"

import { FormField } from "./FormField"

import {
  fieldsReducer,
  getFieldsInitialState,
  getFormFieldsValidationResult
} from "./Form.utils"

type FormProps<T extends FormData> = {
  containerClassName?: string
  title: ReactNode
  submitLabel: ReactNode
  action: (fieldsValueMap: T) => Promise<unknown>
  fields: ExtendedFormFieldsSchema<T>
  children?: ReactNode
}

export const Form = <T extends FormData>({
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

    const { formData, hasValidationError, validatedFieldsState } =
      getFormFieldsValidationResult(fieldsState)
    dispatchFieldsAction({ type: "SET_FIELDS", fields: validatedFieldsState })

    if (hasValidationError) {
      return
    }

    await mutateAction(formData)
  }

  const formClassName = mergeClassNames(
    "flex flex-col gap-5 items-center border border-primary rounded-sm p-5 bg-white dark:bg-black sm:min-w-sm w-full max-w-md",
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

      <div className="w-full flex flex-wrap justify-evenly gap-3">
        {Object.entries(fieldsState).map(([name, props]) => {
          const { shouldHide, ...remainingProps } = props
          const isHidden = shouldHide?.(fieldsValues)

          if (isHidden) {
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
