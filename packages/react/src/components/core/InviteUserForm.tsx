import { toast } from "react-toastify"
import { useReduxSelector } from "../../redux/config"

import { Form } from "../basic/Form/Form"

import { inviteUser } from "../../api/users"

import { getEmailError } from "../../utils/validations"

import type { Fields, FormAction } from "../basic/Form/models"

type FormFields = { email: string; role: string }

const fields: Fields<FormFields> = {
  email: {
    label: "Email",
    validator: getEmailError,
    type: "text"
  },
  role: {
    label: "Role",
    type: "toggle"
  }
}

export const InviteUserForm = () => {
  const { user } = useReduxSelector(state => state.userReducer)

  const inviteAction: FormAction<FormFields> = async ({ email, role }) => {
    const idToken = await user.getIdToken()
    const error = await inviteUser({ idToken, email, role })

    if (!error) {
      toast.success("User invited successfully")
    }

    return error
  }

  return (
    <Form<FormFields>
      title="Invite user"
      action={inviteAction}
      submitLabel="Invite"
      fields={fields}
    />
  )
}
