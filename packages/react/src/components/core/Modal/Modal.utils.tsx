import { lazy } from "react"

import type { ModalProps } from "./Modal.model"

const ConfirmationModal = lazy(() =>
  import("@/components/core/ConfirmationModal").then(module => ({
    default: module.ConfirmationModal
  }))
)
const UserModal = lazy(() =>
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
      return <ConfirmationModal {...props} />
    case "user":
      return <UserModal {...props} />
    case "checks-bulk-export":
      return <ChecksBulkExportModal />
  }
}
