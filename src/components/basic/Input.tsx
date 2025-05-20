import {
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
  type MouseEventHandler
} from "react"

import { mergeClassNames } from "../../utils/mergeClassNames"

import type { FormFieldComponentProps } from "./Form/models"

export type InputProps = Partial<FormFieldComponentProps<string>> &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onClick"
  > & {
    onClick?: MouseEventHandler<HTMLDivElement | HTMLInputElement>
    startAdornment?: ReactNode
    endAdornment?: ReactNode
    containerClassName?: string
  }

export const Input = ({
  label,
  error,
  className,
  startAdornment,
  endAdornment,
  containerClassName: additionalContainerClassName,
  value,
  onFocus,
  onClick,
  ...props
}: InputProps) => {
  const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const newValue = target.value

    props.onChange?.(newValue)
  }

  const containerClassName = mergeClassNames(
    !label && "w-full",
    additionalContainerClassName
  )

  const hasAdornment = !!(startAdornment || endAdornment)

  const inputClassName = mergeClassNames(
    !hasAdornment && error && "invalid-input",
    !hasAdornment && className,
    hasAdornment && "border-none p-0 ring-0 cursor-[inherit]"
  )

  const inputProps = {
    ...props,
    className: inputClassName,
    value,
    onChange,
    onFocus
  }

  const renderedInputOnClick = label && onClick ? onClick : undefined

  const renderedInput = hasAdornment ? (
    <div
      className={mergeClassNames(
        "flex items-center border rounded-sm px-2 focus-within:ring-1 focus-within:ring-primary  dark:focus-within:ring-secondary",
        error && "invalid-input",
        className
      )}
      onClick={renderedInputOnClick}
    >
      {startAdornment}
      <input {...inputProps} />
      {endAdornment}
    </div>
  ) : (
    <input {...inputProps} onClick={renderedInputOnClick} />
  )

  const renderedContent = (
    <>
      {renderedInput}
      {error && <span className="form-error">{error}</span>}
    </>
  )

  if (!label) {
    return <div className={containerClassName}>{renderedContent}</div>
  }

  return (
    <label onClick={e => e.preventDefault()} className={containerClassName}>
      <span>{label}</span>
      {renderedContent}
    </label>
  )
}
