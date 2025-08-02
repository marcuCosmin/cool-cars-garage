import { useMemo, type MouseEvent, type ReactNode } from "react"
import { Tooltip } from "react-tooltip"
import * as icons from "react-bootstrap-icons"

import { mergeClassNames } from "@/utils/mergeClassNames"

type IconNames = keyof typeof icons

export type IconProps = {
  iconName: IconNames
  size?: number
  className?: string
  label?: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
}

let iconsCount = 0

export const Icon = ({
  iconName,
  label,
  className,
  size = 16,
  onClick
}: IconProps) => {
  const IconComponent = icons[iconName]

  const tooltipId = useMemo(() => `icon-tooltip-${iconsCount++}`, [])

  const mergedClassName = mergeClassNames("outline-0", className)

  if (!IconComponent) {
    throw new Error(`Icon "${iconName}" not found in react-bootstrap-icons`)
  }

  const renderedIcon = (
    <>
      <IconComponent
        height={size}
        width={size}
        className={mergedClassName}
        data-tooltip-id={onClick ? undefined : tooltipId}
      />
      <Tooltip id={tooltipId} place="bottom">
        {label}
      </Tooltip>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className="p-0 bg-transparent border-0 cursor-pointer text-primary dark:text-secondary w-fit"
        data-tooltip-id={tooltipId}
        onClick={onClick}
      >
        {renderedIcon}
      </button>
    )
  }

  return renderedIcon
}
