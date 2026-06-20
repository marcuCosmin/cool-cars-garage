import {
  createElement,
  type ComponentPropsWithoutRef,
  type HTMLElementType,
  type ReactNode
} from "react"
import type { Icon as ReactIcon } from "react-bootstrap-icons"

import { mergeClassNames } from "@/utils/mergeClassNames"

import { Loader } from "@/components/basic/Loader"

const iconsSize = 20

type DataViewMetadataItemProps<T extends HTMLElementType> = {
  Icon: ReactIcon
  label: string
  parsedValue: ReactNode
  isLoading?: boolean
  error?: string
  containerTag?: T
  containerProps?: ComponentPropsWithoutRef<T>
}

export const DataViewMetadataItem = <T extends HTMLElementType = "p">({
  Icon,
  label,
  parsedValue,
  isLoading,
  error,
  containerTag = "p" as T,
  containerProps
}: DataViewMetadataItemProps<T>) => {
  const getValue = () => {
    if (isLoading) {
      return <Loader size="sm" />
    }

    if (error) {
      return error
    }

    return parsedValue
  }

  return createElement(
    containerTag,
    {
      ...containerProps,
      className: mergeClassNames(
        "flex items-start gap-2",
        containerProps?.className
      )
    },
    <Icon
      className="shrink-0 fill-primary"
      height={iconsSize}
      width={iconsSize}
    />,
    <span>
      <span className="text-primary font-bold">{label}:</span>{" "}
      <span
        className={mergeClassNames(
          "text-black dark:text-white font-normal",
          error && "text-error"
        )}
      >
        {getValue()}
      </span>
    </span>
  )
}
