import ReactModal from "react-modal"

import { getModalContent } from "./Modal.utils"

import { useReduxDispatch, useReduxSelector } from "../../../redux/config"
import { closeModal } from "../../../redux/modalSlice"

export const Modal = () => {
  const modalOptions = useReduxSelector(state => state.modalReducer)
  const dispatch = useReduxDispatch()

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
