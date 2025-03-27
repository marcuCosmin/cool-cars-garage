type GenericActionState = Record<string, string>

export type FieldValidator = { validator?: (value: string) => string }
export type FormError = {
  form: string | undefined
}
export type Fields<T extends GenericActionState> = {
  [key in keyof T]: FieldValidator | undefined
}

type Action<T extends GenericActionState> = (
  prevErrors: T & FormError,
  formData: FormData
) => Promise<T & FormError>

export type SimplifiedFormAction<T> = (
  formData: T
) => Promise<string | undefined> | string | undefined

type CreateFormActionArgs<T extends GenericActionState> = {
  fields: Fields<T>
  action: SimplifiedFormAction<T>
}

export const createFormAction = <T extends Record<string, string>>({
  fields,
  action
}: CreateFormActionArgs<T>) => {
  const createdAction: Action<T> = async (prevErrors, formData) => {
    const newErrors: T = { ...prevErrors, form: "" }

    const fieldsEntries = Object.entries(fields)

    fieldsEntries.forEach(([field, fieldProps]) => {
      const fieldValue = formData.get(field) as string
      const error = fieldProps?.validator?.(fieldValue) || ""

      newErrors[field as keyof T] = error as T[keyof T]
    })

    if (Object.values(newErrors).some(error => error)) {
      return { ...prevErrors, ...newErrors }
    }

    const actionArgs: T = {} as T

    fieldsEntries.forEach(([field]) => {
      actionArgs[field as keyof T] = formData.get(field) as T[keyof T]
    })

    const error = await action(actionArgs)

    return { ...newErrors, form: error }
  }

  return createdAction
}
