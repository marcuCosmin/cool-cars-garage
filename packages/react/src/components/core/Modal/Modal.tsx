import ReactModal from "react-modal"

import { useModalContext } from "@/contexts/Modal/Modal.context"

import { getModalContent } from "./Modal.utils"

import type { ModalProps } from "./Modal.model"

export const Modal = (props: ModalProps) => {
  const { setModalProps } = useModalContext()

  const onRequestClose = () => setModalProps(null)

  return (
    <ReactModal ariaHideApp={false} onRequestClose={onRequestClose} isOpen>
      {getModalContent(props)}
    </ReactModal>
  )
}
