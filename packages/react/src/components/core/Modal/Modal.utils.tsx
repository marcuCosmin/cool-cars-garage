import { lazy } from "react"

import type { ModalOptions } from "./Modal.model"

const ConfirmationModalContent = lazy(() =>
  import("./ConfirmationModalContent").then(module => ({
    default: module.ConfirmationModalContent
  }))
)
const CarModalContent = lazy(() =>
  import("./CarModalContent").then(module => ({
    default: module.CarModalContent
  }))
)

export const getModalContent = ({ type, props }: ModalOptions) => {
  switch (type) {
    case "confirmation":
      return <ConfirmationModalContent {...props} />
    case "car":
      return <CarModalContent />
  }
}
