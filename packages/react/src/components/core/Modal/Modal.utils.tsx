import { lazy } from "react"

import type { ModalProps } from "./Modal.model"

const ConfirmationModalContent = lazy(() =>
  import("@/components/core/ConfirmationModalContent").then(module => ({
    default: module.ConfirmationModalContent
  }))
)
const UserFrom = lazy(() =>
  import("@/components/core/UserForm/UserForm").then(module => ({
    default: module.UserForm
  }))
)

const ChecksBulkExportModal = lazy(() =>
  import("@/components/core/ChecksBulkExportModal").then(module => ({
    default: module.ChecksBulkExportModal
  }))
)

export const getModalContent = ({ type, props }: ModalProps) => {
  switch (type) {
    case "confirmation":
      return <ConfirmationModalContent {...props} />
    case "user":
      return <UserFrom {...props} />
    case "checks-bulk-export":
      return <ChecksBulkExportModal />
  }
}
