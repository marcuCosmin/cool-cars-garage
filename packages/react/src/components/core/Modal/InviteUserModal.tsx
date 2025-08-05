import { toast } from "react-toastify"

import { inviteUser } from "@/api/users"

import { firebaseAuth } from "@/firebase/config"

import { Form } from "@/components/basic/Form/Form"
import type { Fields, FormAction } from "@/components/basic/Form/Form.models"

import { getEmailError, getRequiredError } from "@/utils/validations"

type FormFields = {
  email: string
  role: string
  badgeNumber: string
  badgeExpirationDate: string
}

const fields: Fields<FormFields> = {
  email: {
    label: "Email",
    validator: getEmailError,
    type: "text"
  },
  role: {
    label: "Role",
    type: "select",
    options: ["Admin", "Manager", "Driver"],
    validator: getRequiredError
  },
  badgeNumber: {
    label: "Badge Number",
    type: "number",
    validator: getRequiredError,
    displayCondition: ({ role }) => role === "Driver"
  },
  badgeExpirationDate: {
    label: "Badge Expiration Date",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ role }) => role === "Driver"
  }
}

export const InviteUserModal = () => {
  const inviteAction: FormAction<FormFields> = async ({ email, role }) => {
    const idToken = await firebaseAuth.currentUser!.getIdToken()
    const error = await inviteUser({ idToken, email, role })

    if (!error) {
      toast.success("User invited successfully")
    }
  }

  return (
    <Form
      containerClassName="p-0 border-none"
      title="Invite user"
      action={inviteAction}
      submitLabel="Invite"
      fields={fields}
    />
  )
}
