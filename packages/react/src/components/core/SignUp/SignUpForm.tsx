import { useNavigate } from "react-router"

import { createUser } from "@/api/utils"

import { signInUserAfterCreation } from "@/firebase/utils"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"

import { SignUpFormData, getSignUpFormFields } from "@/shared/forms/forms.const"

import type { Invitation } from "./SignUp.model"

type SignUpFormProps = {
  invitation: Invitation
}

export const SignUpForm = ({ invitation }: SignUpFormProps) => {
  const navigate = useNavigate()

  const fields = extendFormFields({
    fieldsSchema: getSignUpFormFields(invitation),
    additionalFieldsProps: {
      email: {
        label: "Email",
        defaultValue: invitation.email,
        disabled: true
      },
      password: {
        label: "Password"
      },
      firstName: {
        label: "First Name"
      },
      lastName: {
        label: "Last Name"
      },
      birthDate: {
        label: "Birth Date"
      }
    }
  })

  const action = async (data: SignUpFormData) => {
    const response = await createUser({
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
