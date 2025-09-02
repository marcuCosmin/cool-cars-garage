import { lazy } from "react"

import type { ModalOptions } from "./Modal.model"

const ConfirmationModalContent = lazy(() =>
  import("../ConfirmationModalContent").then(module => ({
    default: module.ConfirmationModalContent
  }))
)
const CarModalContent = lazy(() =>
  import("./CarModalContent").then(module => ({
    default: module.CarModalContent
  }))
)
const InviteUserForm = lazy(() =>
  import("../InviteUserForm").then(module => ({
    default: module.InviteUserForm
  }))
)
const EditUserForm = lazy(() =>
  import("../EditUserForm").then(module => ({
    default: module.EditUserForm
  }))
)

export const getModalContent = ({ type, props }: ModalOptions) => {
  switch (type) {
    case "confirmation":
      return <ConfirmationModalContent {...props} />
    case "car":
      return <CarModalContent />
    case "invite-user":
      return <InviteUserForm />
    case "edit-user":
      return <EditUserForm {...props} />
  }
}
