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
const UserFrom = lazy(() =>
  import("../UserForm/UserForm").then(module => ({
    default: module.UserForm
  }))
)

const ChecksBulkExportModal = lazy(() =>
  import("../ChecksBulkExportModal").then(module => ({
    default: module.ChecksBulkExportModal
  }))
)

export const getModalContent = ({ type, props }: ModalOptions) => {
  switch (type) {
    case "confirmation":
      return <ConfirmationModalContent {...props} />
    case "car":
      return <CarModalContent />
    case "user":
      return <UserFrom {...props} />
    case "checks-bulk-export":
      return <ChecksBulkExportModal />
  }
}
