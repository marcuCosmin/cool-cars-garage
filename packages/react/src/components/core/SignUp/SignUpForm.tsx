import { useNavigate } from "react-router"

import { createUserFromInvitation } from "@/api/utils"

import { signInUserAfterCreation } from "@/firebase/utils"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"

import {
  signUpFormFields,
  type SignUpFormData
} from "@/shared/forms/forms.const"

import type { Invitation } from "./SignUp.model"

type SignUpFormProps = {
  invitation: Invitation
}

export const SignUpForm = ({ invitation }: SignUpFormProps) => {
  const fields = extendFormFields({
    fieldsSchema: signUpFormFields,
    additionalFieldsProps: {
      email: {
        label: "Email",
        defaultValue: invitation.email,
        disabled: true
      },
      password: {
        label: "Password"
      }
    }
  })

  const navigate = useNavigate()

  const action = async (data: SignUpFormData) => {
    const response = await createUserFromInvitation({
      ...data,
      invitationId: invitation.id
    })

    if (response.authToken) {
      await signInUserAfterCreation(response.authToken)
      await navigate("/", { replace: true })
    }
  }

  return (
    <Form
      containerClassName="fixed non-relative-center"
      title="Cool Cars Garage"
      submitLabel="Sign Up"
      fields={fields}
      action={action}
    />
  )
}
