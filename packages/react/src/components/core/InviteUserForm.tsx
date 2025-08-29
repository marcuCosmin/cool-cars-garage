import { toast } from "react-toastify"

import { inviteUser } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { closeModal } from "@/redux/modalSlice"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"

import {
  inviteUserFormFields,
  type InviteUserFormData
} from "@/shared/forms/forms.const"

const fields = extendFormFields({
  fieldsSchema: inviteUserFormFields,
  additionalFieldsProps: {
    email: {
      label: "Email"
    },
    role: {
      label: "Role",
      options: ["Admin", "Manager", "Driver"]
    },
    dbsUpdate: {
      label: "DBS Update"
    },
    isTaxiDriver: {
      label: "Is Taxi Driver"
    },
    badgeNumber: {
      label: "Badge Number"
    },
    badgeExpirationDate: {
      label: "Badge Expiration Date"
    }
  }
})

export const InviteUserForm = () => {
  const dispatch = useAppDispatch()
  const action = async (data: InviteUserFormData) => {
    const { message } = await inviteUser(data)

    if (message) {
      toast.success(message)
      dispatch(closeModal())
    }
  }

  return (
    <Form
      containerClassName="p-0 border-none"
      title="Invite user"
      action={action}
      submitLabel="Invite"
      fields={fields}
    />
  )
}
