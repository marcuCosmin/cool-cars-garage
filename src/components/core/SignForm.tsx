import { Link, useNavigate } from "react-router"

import { signInUser } from "../../firebase/auth"
import { createUser } from "../../api/users"

import {
  getEmailError,
  getNameError,
  getPasswordError
} from "../../utils/validations"

import { Form } from "../basic/Form/Form"
import type { Fields, FormAction } from "../basic/Form/models"

import type { Invitation } from "../../models"

export type SignFormProps = {
  formType: "sign-in" | "sign-up"
  invitation?: Invitation
}

type FormFields = {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

type Config = {
  [key: string]: {
    submitLabel: string
    url?: {
      href: string
      text: string
      label: string
    }
    authAction: typeof createUser | typeof signInUser
    emailDisabled: boolean
  }
}

const config: Config = {
  "sign-in": {
    submitLabel: "Sign in",
    authAction: signInUser,
    emailDisabled: false
  },
  "sign-up": {
    submitLabel: "Sign up",
    url: {
      href: "/sign-in",
      text: "Sign in",
      label: "Already have an account?"
    },
    authAction: createUser,
    emailDisabled: true
  }
}

type GetFormFieldsArgs = Pick<SignFormProps, "invitation"> & {
  emailDisabled: boolean
  formType: keyof Config
}

const getFormFields = ({
  emailDisabled,
  formType,
  invitation
}: GetFormFieldsArgs) => {
  const fields: Fields<FormFields> = {
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

export const SignForm = ({ formType, invitation }: SignFormProps) => {
  const { submitLabel, url, emailDisabled, authAction } = config[formType]

  const navigate = useNavigate()

  const action: FormAction<FormFields> = async ({
    email,
    password,
    firstName,
    lastName
  }) => {
    if (formType === "sign-in") {
      return (authAction as typeof signInUser)({ email, password })
    }

    const actionResponse = await (authAction as typeof createUser)({
      firstName: firstName as string,
      lastName: lastName as string,
      email,
      password,
      invitationId: invitation?.id as string
    })

    navigate("/")

    return actionResponse
  }

  const fields = getFormFields({ emailDisabled, formType, invitation })

  return (
    <Form<FormFields>
      containerClassName="fixed non-relative-center"
      title="Cool Cars Garage"
      submitLabel={submitLabel}
      action={action}
      fields={fields}
    >
      {url && (
        <div className="w-full">
          {url.label}
          <Link className="ml-2" to={url.href}>
            {url.text}
          </Link>
        </div>
      )}
    </Form>
  )
}
