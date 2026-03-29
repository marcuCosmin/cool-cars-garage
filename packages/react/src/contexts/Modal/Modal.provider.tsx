import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react"
import { useLocation } from "react-router"

import { Loader } from "@/components/basic/Loader"
import type { ModalProps } from "@/components/basic/Modal/Modal.model"

import { ModalContext } from "./Modal.context"

const Modal = lazy(() =>
  import("@/components/basic/Modal/Modal").then(module => ({
    default: module.Modal
  }))
)

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
      {modalProps && (
        <Suspense fallback={<Loader enableOverlay />}>
          <Modal {...modalProps} />
        </Suspense>
      )}
    </ModalContext>
  )
}
