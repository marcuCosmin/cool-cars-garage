import { toast } from "react-toastify"

import { createUser } from "@/api/utils"

import { useAppDispatch } from "@/redux/config"
import { closeModal } from "@/redux/modalSlice"

import { Form } from "@/components/basic/Form/Form"

import { extendFormFields } from "@/utils/extendFormFields"

import { userFormFields, type UserFormData } from "@/shared/forms/forms.const"

const fields = extendFormFields({
  fieldsSchema: userFormFields,
  additionalFieldsProps: {
    email: {
      label: "Email"
    },
    firstName: {
      label: "First Name"
    },
    lastName: {
      label: "Last Name"
    },
    birthDate: {
      label: "Birth Date"
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
    },
    isPSVDriver: {
      label: "Is PSV Driver"
    }
  }
})

export const UserForm = () => {
  const dispatch = useAppDispatch()

  const action = async (data: UserFormData) => {
    const { message } = await createUser(data)

    toast.success(message)
    dispatch(closeModal())
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
