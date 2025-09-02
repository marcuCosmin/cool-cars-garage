import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"

import { useAppDispatch } from "@/redux/config"
import { closeModal } from "@/redux/modalSlice"

import { useAppMutation } from "@/hooks/useAppMutation"

import { mergeClassNames } from "@/utils/mergeClassNames"

import { Loader } from "@/components/basic/Loader"

export type ConfirmationModalContentProps = {
  text: string
  onConfirm: () => Promise<void>
}

const iconsSize = 20
const buttonsClassNames =
  "flex gap-2 justify-center items-center border border-primary"

export const ConfirmationModalContent = ({
  text,
  onConfirm
}: ConfirmationModalContentProps) => {
  const { isLoading, mutate: handleConfirm } = useAppMutation({
    mutationFn: onConfirm,
    showToast: true
  })
  const dispatch = useAppDispatch()

  const onConfirmClick = async () => {
    await handleConfirm()

    dispatch(closeModal())
  }
  const onCancelClick = () => dispatch(closeModal())

  return (
    <div className="flex flex-col relative gap-20 max-w-md">
      {isLoading && <Loader enableOverlay />}

      <h1 className="text-center text-2xl">{text}</h1>

      <div className="flex justify-around gap-5">
        <button
          className={mergeClassNames(
            buttonsClassNames,
            "bg-primary text-white"
          )}
          type="button"
          onClick={onConfirmClick}
        >
          <CheckCircleFill size={iconsSize} />
          Confirm
        </button>
        <button
          className={mergeClassNames(
            buttonsClassNames,
            "bg-transparent text-primary"
          )}
          type="button"
          onClick={onCancelClick}
        >
          <XCircleFill size={iconsSize} />
          Cancel
        </button>
      </div>
    </div>
  )
}
