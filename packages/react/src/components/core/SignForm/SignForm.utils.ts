import type { Fields } from "@/components/basic/Form/Form.models"

import {
  getEmailError,
  getNameError,
  getPasswordError
} from "@/utils/validations"

import type {
  SignFormFields,
  SignFormProps,
  SignFormType
} from "./SignForm.model"

type GetFormFieldsArgs = Pick<SignFormProps, "invitation"> & {
  emailDisabled: boolean
  formType: SignFormType
}

export const getFormFields = ({
  emailDisabled,
  formType,
  invitation
}: GetFormFieldsArgs) => {
  const fields: Fields<SignFormFields> = {
    email: {
      label: "Email",
      validator: getEmailError,
      type: "text",
      readOnly: emailDisabled,
      defaultValue: invitation?.email as string | undefined
    },
    password: {
      label: "Password",
      validator: getPasswordError,
      type: "password"
    }
  }

  if (formType === "sign-up") {
    fields.firstName = {
      label: "First name",
      validator: getNameError,
      type: "text"
    }

    fields.lastName = {
      label: "Last name",
      validator: getNameError,
      type: "text"
    }
  }

  return fields
}
