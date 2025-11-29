import { createContext, useContext } from "react"

import type { ModalProps } from "@/components/core/Modal/Modal.model"

export type ModalState = {
  setModalProps: (props: ModalProps | null) => void
}

export const ModalContext = createContext<ModalState | undefined>(undefined)

export const useModalContext = () => {
  const context = useContext(ModalContext)

  if (context === undefined) {
    throw new Error("'useModalContext' must be used inside a ModalProvider!")
  }

  return context
}
