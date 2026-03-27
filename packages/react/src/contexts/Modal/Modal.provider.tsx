import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useLocation } from "react-router"

import { Modal } from "@/components/core/Modal/Modal"
import type { ModalProps } from "@/components/core/Modal/Modal.model"

import { ModalContext } from "./Modal.context"

type ModalProviderProps = {
  children: ReactNode
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalProps, setModalProps] = useState<ModalProps | null>(null)
  const location = useLocation()

  const value = useMemo(() => ({ setModalProps }), [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModalProps(null)
  }, [location.pathname])

  return (
    <ModalContext value={value}>
      {children}
      {modalProps && <Modal {...modalProps} />}
    </ModalContext>
  )
}
