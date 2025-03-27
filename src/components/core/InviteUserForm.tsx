import { toast } from "react-toastify"
import { useReduxSelector } from "../../redux/config"

import { Form } from "../basic/Form"

import { inviteUser } from "../../api/users"

import { getEmailError } from "../../utils/validations"

const defaultActionState = {
  email: "",
  role: ""
}

type ActionState = typeof defaultActionState

const fields = {
  email: {
    label: "Email",
    validator: getEmailError,
    type: "text"
  },
  role: {
    label: "Role",
    type: "toggle",
    firstOption: {
      label: "User",
      value: "user"
    },
    secondOption: {
      label: "Admin",
      value: "admin"
    }
  }
}

export const InviteUserForm = () => {
  const { user } = useReduxSelector(state => state.userReducer)

  const inviteAction = async ({ email, role }: ActionState) => {
    const idToken = await user.getIdToken()
    const error = await inviteUser({ idToken, email, role })

    if (!error) {
      toast.success("User invited successfully")
    }

    return error
  }

  return (
    <Form<ActionState>
      containerClassName="p-0 border-0 bg-transparent dark:bg-transparent max-w-auto"
      title="Invite user"
      defaultActionState={defaultActionState}
      action={inviteAction}
      submitLabel="Invite"
      fields={fields}
    />
  )
}
