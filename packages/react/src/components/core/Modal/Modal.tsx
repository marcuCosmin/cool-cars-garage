import ReactModal from "react-modal"

import { closeModal } from "@/redux/modalSlice"
import { useAppDispatch, useAppSelector } from "@/redux/config"

import { getModalContent } from "./Modal.utils"

export const Modal = () => {
  const modalOptions = useAppSelector(state => state.modal)
  const dispatch = useAppDispatch()

  if (modalOptions.type === "none") {
    return null
  }

  const modalContent = getModalContent(modalOptions)

  const onRequestClose = () => dispatch(closeModal())

  return (
    <ReactModal onRequestClose={onRequestClose} isOpen>
      {modalContent}
    </ReactModal>
  )
}
