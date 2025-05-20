import { useState, type ReactNode } from "react"
import Modal from "react-modal"

type ActionModalProps = {
  children: ReactNode
  buttonContent: ReactNode
}

export const ActionModal = ({ children, buttonContent }: ActionModalProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onClick = () => setIsOpen(true)
  const onRequestClose = () => setIsOpen(false)

  return (
    <div>
      <button
        className="w-fit h-fit bg-transparent border-0"
        type="button"
        onClick={onClick}
      >
        {buttonContent}
      </button>
      <Modal
        className="action-modal"
        isOpen={isOpen}
        onRequestClose={onRequestClose}
      >
        {children}
      </Modal>
    </div>
  )
}
