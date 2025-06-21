import { Mail, Phone } from "lucide-react"

import { clsx } from "clsx"

const iconsWidth = 18

const iconsMap = {
  email: Mail,
  phoneNumber: Phone
}

type UserFieldProps = {
  label?: string
  icon?: keyof typeof iconsMap
  value: string | null | undefined
  level?: "primary" | "secondary"
}

const getDisplayedLabel = ({
  label,
  icon
}: Pick<UserFieldProps, "label" | "icon">) => {
  if (icon) {
    const Icon = iconsMap[icon]

    return <Icon width={iconsWidth} />
  }

  return label
}

export const UserField = ({
  label,
  icon,
  value,
  level = "primary"
}: UserFieldProps) => {
  const displayedLabel = getDisplayedLabel({ label, icon })

  const isPrimaryLevel = level === "primary"

  const className = clsx(
    "flex items-center gap-2",
    isPrimaryLevel && "text-sm",
    !isPrimaryLevel && "text-xs"
  )

  return (
    <div className={className}>
      {displayedLabel && <b>{displayedLabel}</b>}
      <span>{value}</span>
    </div>
  )
}
