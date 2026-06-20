import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useLocation } from "react-router"

import { Modal } from "@/components/basic/Modal/Modal"
import type { ModalProps } from "@/components/basic/Modal/Modal.model"

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
      {/* 
        Not lazy loaded as I expect in 30% of the time to be used by the user when accessing the app
        Also the react-modal library is pretty light and the double suspense looks wierd for the users
        Also the real lazy loading is done in the Modal.utils.tsx
      */}
      {modalProps && <Modal {...modalProps} />}
    </ModalContext>
  )
}
