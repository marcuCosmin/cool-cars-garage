import { useState, type ReactNode, type FormEvent } from "react"

import { mergeClassNames } from "../../utils/mergeClassNames"

import { Loader } from "./Loader"
import { Input, type InputProps } from "./Input"
import { Toggle, type ToggleProps } from "./Toggle"

import {
  createFormAction,
  type SimplifiedFormAction,
  type FieldValidator,
  type FormError,
  type Fields as ActionField
} from "../../utils/createFormAction"

export type Fields<T> = {
  [key in keyof T]: (FieldValidator &
    (InputProps | Omit<ToggleProps, "name">)) & {
    type: InputProps["type"] | "toggle"
  }
}

type FormProps<T extends Record<string, string>> = {
  containerClassName?: string
  title: ReactNode
  submitLabel: ReactNode
  defaultActionState: Awaited<T>
  action: SimplifiedFormAction<T>
  fields: Fields<T>
  children?: ReactNode
}

const splitFieldsProps = <T extends Record<string, string>>(
  fields: Fields<T>
) => {
  const reducerInitial = {
    actionFields: {} as ActionField<T>,
    formFields: {} as Omit<Fields<T>, "validator">
  }
  //use reduce to split fields into two arrays
  return Object.entries(fields).reduce((acc, [field, fieldProps]) => {
    const { validator, ...formFieldProps } = fieldProps

    acc.actionFields[field as keyof ActionField<T>] = {
      validator
    }

    acc.formFields[field as keyof Omit<Fields<T>, "validator">] = formFieldProps

    return acc
  }, reducerInitial)
}
export const Form = <T extends Record<string, string>>({
  title,
  submitLabel,
  containerClassName,
  defaultActionState,
  action,
  fields,
  children
}: FormProps<T>) => {
  const { formFields, actionFields } = splitFieldsProps(fields)

  const createdAction = createFormAction<T>({ fields: actionFields, action })
  const initialActionState = { ...defaultActionState, form: "" } as Awaited<
    T & FormError
  >

  const [errors, setErrors] = useState<T & FormError>(initialActionState)
  const { form: formError } = errors
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)

    const newErrors = await createdAction(errors, formData)

    setErrors(newErrors)

    setIsLoading(false)
  }

  const formClassName = mergeClassNames(
    "flex flex-col gap-5 items-center border rounded-md p-5 max-w-md dark:bg-primary w-[95%] shadow-lg",
    containerClassName
  )

  return (
    <form className={formClassName} onSubmit={onSubmit}>
      {isLoading && <Loader enableOverlay />}

      <h1>{title}</h1>

      <hr />

      {Object.keys(formFields).map(field => {
        const props = fields[field]
        const { type } = props

        if (type === "toggle") {
          return (
            <Toggle
              {...(props as Omit<ToggleProps, "name">)}
              name={field}
              key={field}
            />
          )
        }

        return (
          <Input
            {...props}
            type={type as InputProps["type"]}
            key={field}
            name={field}
            error={errors[field as keyof typeof errors]}
          />
        )
      })}

      {children}

      <hr />

      {formError && <span className="form-error">{formError}</span>}

      <button type="submit">{submitLabel}</button>
    </form>
  )
}
