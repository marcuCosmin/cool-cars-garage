import { useState, type ReactNode } from "react"
import { ChevronDown } from "react-bootstrap-icons"

import { mergeClassNames } from "@/utils/mergeClassNames"

type CollapsibleProps = {
  title: ReactNode | ((isOpen: boolean) => ReactNode)
  children: ReactNode
  containerClassName?: string
  buttonClassName?: string
  contentClassName?: string
  defaultOpen?: boolean
}

export const Collapsible = ({
  title,
  children,
  containerClassName,
  buttonClassName,
  contentClassName,
  defaultOpen = false
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const onButtonClick = () => setIsOpen(prevState => !prevState)

  return (
    <div className={mergeClassNames("w-full", containerClassName)}>
      <button
        className={mergeClassNames(
          "flex justify-between items-center gap-2",
          buttonClassName
        )}
        type="button"
        onClick={onButtonClick}
      >
        {typeof title === "function" ? title(isOpen) : title}
        <ChevronDown
          className={`fill-black dark:fill-white transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div
          className={mergeClassNames(
            `flex flex-col gap-3 pl-5 transition-all duration-300 ${isOpen ? "mt-3" : "mt-0"}`,
            contentClassName,
            "overflow-hidden"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
