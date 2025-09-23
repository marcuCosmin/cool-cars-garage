import {
  useState,
  createElement,
  type PropsWithChildren,
  type HTMLElementType,
  type ComponentPropsWithoutRef
} from "react"
import {
  ArrowContainer,
  Popover,
  type ContentRenderer
} from "react-tiny-popover"

import { mergeClassNames } from "@/utils/mergeClassNames"

type TooltipProps<T extends HTMLElementType> = PropsWithChildren<{
  label: string
  containerTag?: T
  containerProps?: ComponentPropsWithoutRef<T>
}>

export const Tooltip = <T extends HTMLElementType = "div">({
  label,
  children,
  containerTag = "div" as T,
  containerProps
}: TooltipProps<T>) => {
  const mergedContainerClassName = mergeClassNames(
    "w-fit",
    containerProps?.className
  )
  const [isOpen, setIsOpen] = useState(false)

  const onMouseEnter = () => setIsOpen(true)
  const onMouseLeave = () => setIsOpen(false)

  const content: ContentRenderer = ({ position, childRect, popoverRect }) => (
    <ArrowContainer
      position={position}
      childRect={childRect}
      popoverRect={popoverRect}
      arrowSize={10}
      arrowColor="#007bff"
    >
      <div className="font-bold text-primary border border-primary p-2 rounded-md bg-white dark:bg-black">
        {label}
      </div>
    </ArrowContainer>
  )

  return (
    <>
      <Popover
        content={content}
        isOpen={isOpen}
        positions={["bottom", "top", "right", "left"]}
      >
        {createElement(containerTag, {
          ...containerProps,
          children,
          onMouseEnter,
          onMouseLeave,
          className: mergedContainerClassName
        })}
      </Popover>
    </>
  )
}
