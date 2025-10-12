import { mergeClassNames } from "@/utils/mergeClassNames"

type TabOption = {
  label: string
  value: string
}

type TabProps<T extends TabOption[] = TabOption[]> = {
  options: T
  value: T[number]["value"]
  className?: string
  onChange: (value: T[number]["value"]) => void
}

export const Tab = <T extends TabOption[]>({
  options,
  value,
  className,
  onChange
}: TabProps<T>) => {
  const mergedClassName = mergeClassNames("flex", className)

  return (
    <div className={mergedClassName}>
      {options.map(({ value: optionValue, label }, index) => {
        const isActive = optionValue === value
        const isFirst = index === 0
        const isLast = index === options.length - 1
        const className = mergeClassNames(
          "w-fit rounded-none border border-primary",
          isActive ? "bg-primary text-white" : "bg-transparent text-primary",
          isFirst && "rounded-l-md",
          isLast && "rounded-r-md"
        )
        const onClick = () => onChange(optionValue)

        return (
          <button
            key={optionValue}
            type="button"
            className={className}
            onClick={onClick}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
