import { toast } from "react-toastify"

import { inviteUser } from "@/api/users"

import { firebaseAuth } from "@/firebase/config"

import { Form } from "@/components/basic/Form/Form"
import type { Fields, FormAction } from "@/components/basic/Form/Form.models"

import { getEmailError, getRequiredError } from "@/utils/validations"

import type { DriverMetadata, User, UserMetadata } from "@/shared/models"

type FormFields = Pick<User, "email"> &
  Pick<UserMetadata, "role"> &
  Omit<DriverMetadata, "role" | "birthDate">

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
    displayCondition: ({ role }) => role === "driver"
  },
  isTaxiDriver: {
    label: "Taxi Driver",
    type: "toggle",
    displayCondition: ({ role }) => role === "driver"
  },
  badgeNumber: {
    label: "Badge Number",
    type: "number",
    validator: getRequiredError,
    displayCondition: ({ role, isTaxiDriver }) =>
      role === "driver" && isTaxiDriver
  },
  badgeExpirationDate: {
    label: "Badge Expiration Date",
    type: "date",
    validator: getRequiredError,
    displayCondition: ({ role, isTaxiDriver }) =>
      role === "driver" && isTaxiDriver
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
