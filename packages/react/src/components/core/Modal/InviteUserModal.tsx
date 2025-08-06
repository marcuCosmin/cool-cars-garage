import { toast } from "react-toastify"

import { inviteUser } from "@/api/users"

import { firebaseAuth } from "@/firebase/config"

import { Form } from "@/components/basic/Form/Form"
import type { Fields, FormAction } from "@/components/basic/Form/Form.models"

import { getEmailError, getRequiredError } from "@/utils/validations"

type FormFields = {
  email: string
  role: string
  isTaxiDriver: boolean
  badgeNumber: string
  badgeExpirationDate: string
  dbsUpdate: boolean
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
  dbsUpdate: {
    label: "DBS Update",
    type: "toggle",
    displayCondition: ({ role }) => role === "Driver"
  },
  isTaxiDriver: {
    label: "Taxi Driver",
    type: "toggle",
    displayCondition: ({ role }) => role === "Driver"
  },
  badgeNumber: {
    label: "Badge Number",
    type: "number",
    validator: getRequiredError,
    displayCondition: ({ role, isTaxiDriver }) =>
      role === "Driver" && isTaxiDriver
  },
  badgeExpirationDate: {
    label: "Badge Expiration Date",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ role, isTaxiDriver }) =>
      role === "Driver" && isTaxiDriver
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
