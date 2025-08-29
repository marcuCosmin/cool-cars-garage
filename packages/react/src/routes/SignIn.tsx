import { signInUser } from "@/firebase/utils"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"

import { signInFormFields } from "@/shared/forms/forms.const"

const fields = extendFormFields({
  fieldsSchema: signInFormFields,
  additionalFieldsProps: {
    email: {
      label: "Email"
    },
    password: {
      label: "Password"
    }
  }
})

export const SignIn = () => (
  <Form
    containerClassName="fixed non-relative-center"
    title="Cool Cars Garage"
    submitLabel="Sign In"
    action={signInUser}
    fields={fields}
  />
)
