import ReactModal from "react-modal"

import { useReduxDispatch, useReduxSelector } from "../../redux/config"
import { closeModal } from "../../redux/modalSlice"

export const Modal = () => {
  const { content } = useReduxSelector(state => state.modalReducer)
  const dispatch = useReduxDispatch()

  const isOpen = !!content

  const onRequestClose = () => dispatch(closeModal())

  return (
    <ReactModal
      className="action-modal"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      {content}
    </ReactModal>
  )
}
