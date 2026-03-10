import { useState, type ReactNode, type FocusEventHandler } from "react"
import { Popover } from "react-tiny-popover"

import { mergeClassNames } from "@/utils/mergeClassNames"

type DropdownProps = {
  title: ReactNode
  children: ReactNode
  buttonClassName?: string
  popoverClassName?: string
  alignment?: "start" | "center" | "end"
  onBlur?: FocusEventHandler<HTMLButtonElement>
}

export const Dropdown = ({
  title,
  children,
  buttonClassName,
  popoverClassName,
  alignment = "start",
  onBlur
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onButtonClick = () => setIsOpen(prev => !prev)
  const onClickOutside = ({ target }: MouseEvent) => {
    const castTarget = target as HTMLElement

    if (!castTarget.isConnected) {
      return
    }

    setIsOpen(false)
  }

  const content = (
    <div
      className={mergeClassNames(
        "flex flex-col bg-white dark:bg-black p-2 border border-primary rounded-sm gap-2",
        popoverClassName
      )}
    >
      {children}
    </div>
  )

  return (
    <Popover
      content={content}
      isOpen={isOpen}
      onClickOutside={onClickOutside}
      positions={["bottom", "top", "left", "right"]}
      align={alignment}
    >
      <button
        type="button"
        onClick={onButtonClick}
        className={buttonClassName}
        onBlur={onBlur}
      >
        {title}
      </button>
    </Popover>
  )
}
