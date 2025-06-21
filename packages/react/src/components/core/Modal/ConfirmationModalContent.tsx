import { useState } from "react"

import { useReduxDispatch } from "../../../redux/config"
import { closeModal } from "../../../redux/modalSlice"

import { Loader } from "../../basic/Loader"
import { Icon } from "../../basic/Icon"

export type ConfirmationModalContentProps = {
  text: string
  onConfirm: () => Promise<void> | void
}

export const ConfirmationModalContent = ({
  text,
  onConfirm
}: ConfirmationModalContentProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useReduxDispatch()

  const onConfirmClick = async () => {
    setIsLoading(true)

    await onConfirm()

    setIsLoading(false)
    dispatch(closeModal())
  }
  const onCancelClick = () => dispatch(closeModal())

  return (
    <div className="flex flex-col relative gap-20 max-w-md">
      {isLoading && <Loader />}
      <h1 className="text-center text-2xl">{text}</h1>
      <div className="flex justify-around">
        <Icon iconName="CheckCircleFill" size={50} onClick={onConfirmClick} />

        <Icon iconName="XCircleFill" size={50} onClick={onCancelClick} />
      </div>
    </div>
  )
}
