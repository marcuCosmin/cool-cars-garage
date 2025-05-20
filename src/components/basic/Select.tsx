import { useRef, useState, type FocusEvent } from "react"

import { ChevronDown } from "lucide-react"

import { Input } from "./Input"

import { mergeClassNames } from "../../utils/mergeClassNames"

import type { FormFieldComponentProps } from "./Form/models"

export type SelectProps = FormFieldComponentProps<string> & {
  options: string[]
}

export const Select = ({
  options,
  value,
  onChange,
  onFocus,
  ...props
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const listRef = useRef<HTMLUListElement>(null)

  const inputContainerClassName = mergeClassNames(isOpen && "rounded-b-none")
  const inputClassName = "cursor-pointer relative z-[99999]"

  const onClick = () => setIsOpen(!isOpen)

  const onBlur = ({ relatedTarget }: FocusEvent) => {
    if (listRef.current?.contains(relatedTarget) || !isOpen) {
      return
    }

    setIsOpen(false)
  }

  const onOptionClick = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full" onBlur={onBlur}>
      <Input
        {...props}
        onFocus={onFocus}
        readOnly
        containerClassName={inputContainerClassName}
        className={inputClassName}
        type="text"
        onClick={onClick}
        value={value}
        endAdornment={<ChevronDown className="cursor-pointer" height={24} />}
      />

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute left-0 top-[70px] z-[9000] border rounded-sm rounded-t-none w-full border-t-0 bg-secondary dark:bg-primary"
        >
          {options.map((option, index) => {
            const isFirstOption = index === 0
            const isLastOption = index === options.length - 1
            const className = mergeClassNames(
              "px-2 py-1 cursor-pointer",
              (isFirstOption || isLastOption) && "p-2"
            )

            const onClick = () => onOptionClick(option)

            return (
              <li
                tabIndex={0}
                key={option}
                className={className}
                onClick={onClick}
              >
                {option}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
