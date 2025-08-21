import { Link } from "react-router"

import { type SignInUser } from "@/firebase/utils"

import { Form } from "@/components/basic/Form/Form"
import type { FormAction } from "@/components/basic/Form/Form.models"

import { signFormConfig } from "./SignForm.const"

import { getFormFields } from "./SignForm.utils"

import type { SignFormFields, SignFormProps } from "./SignForm.model"

export const SignForm = ({ formType, invitation }: SignFormProps) => {
  const { submitLabel, emailDisabled, link, authAction } =
    signFormConfig[formType]

  const action: FormAction<SignFormFields> = async ({
    email,
    password,
    firstName,
    lastName
  }) => {
    if (formType === "sign-in") {
      await (authAction as SignInUser)({ email, password })
      return
    }

    await authAction({
      firstName: firstName as string,
      lastName: lastName as string,
      email,
      password,
      invitationId: invitation?.id as string
    })
  }

  const fields = getFormFields({ emailDisabled, formType, invitation })

  return (
    <Form
      containerClassName="fixed non-relative-center"
      title="Cool Cars Garage"
      submitLabel={submitLabel}
      action={action}
      fields={fields}
    >
      {link && (
        <div className="w-full">
          {link.label}
          <Link className="ml-2" to={link.href}>
            {link.text}
          </Link>
        </div>
      )}
    </Form>
  )
}
