import { useMemo, useState, type ReactNode } from "react"

import { Modal } from "@/components/core/Modal/Modal"
import type { ModalProps } from "@/components/core/Modal/Modal.model"

import { ModalContext } from "./Modal.context"

type ModalProviderProps = {
  children: ReactNode
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalProps, setModalProps] = useState<ModalProps | null>(null)

  const value = useMemo(() => ({ setModalProps }), [])

  return (
    <ModalContext value={value}>
      {children}
      {modalProps && <Modal {...modalProps} />}
    </ModalContext>
  )
}
